import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { QueryTypes, Sequelize } from "sequelize";
import { env } from "../../config/index.js";
import initModels from "../../models/index.js";
import {
    hashIdFields,
    resolveOptionalIdFromModel,
} from "../../lib/id-hash.js";

export default class AuthService {
    constructor(sequelize) {
        // Prefer injected sequelize (from Fastify db plugin). Fall back to a new
        // connection if not provided to keep the service usable in isolation.
        this.sequelize =
            sequelize ||
            new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
                host: env.DB_HOST,
                port: env.DB_PORT,
                dialect: env.DB_DIALECT,
                logging: false,
            });

        const models = initModels(this.sequelize);
        this.Member = models.Member;
        this.Role = models.Role;
        this.Department = models.Department;
    }

    async login(credentials = {}) {
        const { email, password } = credentials;
        if (!email || !password) {
            const err = new Error("Email and password are required.");
            err.statusCode = 400;
            throw err;
        }

        const [user] =
            (await this.sequelize.query(
                `SELECT u.id, u.email, u.username, u.password_hash, u.is_active,
                        u.member_id,
                        COALESCE(m.department_id, u.department_id) AS department_id,
                        d.name AS department_name,
                        m.full_name,
                        m.designation AS member_designation,
                        m.phone AS member_phone,
                        m.secondary_phone AS member_secondary_phone,
                        m.whatsapp AS member_whatsapp,
                GROUP_CONCAT(DISTINCT r.slug) AS role_slugs,
                GROUP_CONCAT(DISTINCT r.name) AS role_names
                FROM users u
                LEFT JOIN members m ON m.id = u.member_id
                LEFT JOIN departments d ON d.id = COALESCE(m.department_id, u.department_id)
                LEFT JOIN user_roles ur ON ur.user_id = u.id
                LEFT JOIN roles r ON r.id = ur.role_id
                WHERE u.email = :email AND u.deleted_at IS NULL
                GROUP BY u.id
                LIMIT 1`,
                {
                    type: QueryTypes.SELECT,
                    replacements: { email },
                }
            )) || [];

        if (!user || user.is_active === 0) {
            const err = new Error("Invalid credentials.");
            err.statusCode = 401;
            throw err;
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            const err = new Error("Invalid credentials.");
            err.statusCode = 401;
            throw err;
        }

        const roles = (user.role_slugs || "")
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean);
        const roleNames = (user.role_names || "")
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean);

        const primaryRoleSlug = roles[0] || "user";
        const primaryRoleName = roleNames[0] || "Member";

        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            fullName: user.full_name || user.username,
            role: primaryRoleSlug,
            roleName: primaryRoleName,
            roles,
            designation: user.member_designation || null,
            departmentId: user.department_id ?? null,
            department: user.department_name || null,
            phone: user.member_phone || null,
            secondaryPhone: user.member_secondary_phone || null,
            whatsapp: user.member_whatsapp || null,
        };

        const token = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
            expiresIn: env.ACCESS_TOKEN_EXPIRES_IN || "15m",
        });

        return {
            token,
            user: {
                ...payload,
            },
        };
    }

    async memberOptions(filters = {}) {
        const departmentId = await resolveOptionalIdFromModel(
            this.Department,
            filters?.department_id,
            "department_id",
        );

        const whereConditions = ["LOWER(designation) <> 'vendor'"];

        if (departmentId) {
            whereConditions.push("department_id = :department_id");
        }

        const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

        const members =
            (await this.sequelize.query(
                `
            SELECT id, full_name, email, designation
            FROM members
            ${whereClause}
            ORDER BY full_name ASC
            `,
                {
                    type: QueryTypes.SELECT,
                    replacements: departmentId
                        ? { department_id: departmentId }
                        : {},
                }
            )) || [];

        return hashIdFields(members);
    }

    async roleOptions() {
        const roles =
            (await this.sequelize.query(
                `
            SELECT id, name, slug
            FROM roles
            ORDER BY name ASC
            `,
                { type: QueryTypes.SELECT }
            )) || [];
        return hashIdFields(roles);
    }
}

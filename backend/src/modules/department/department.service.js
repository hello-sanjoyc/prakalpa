import { Sequelize, Op, fn, col } from "sequelize";
import initModels from "../../models/index.js";
import { env } from "../../config/index.js";

export default class DepartmentService {
    constructor(db) {
        this.sequelize =
            db?.sequelize ||
            new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
                host: env.DB_HOST,
                port: env.DB_PORT,
                dialect: env.DB_DIALECT,
                logging: false,
            });

        const models = initModels(this.sequelize);
        this.Department = models.Department;
        this.Member = models.Member;
        this.ProjectStage = models.ProjectStage;
        this.Project = models.Project;
    }

    async list({
        page = 1,
        limit = 25,
        sortBy = "name",
        sortOrder = "asc",
        search = "",
        includeDeleted = false,
    } = {}) {
        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200);
        const offset = (safePage - 1) * safeLimit;
        const orderDir =
            String(sortOrder).toLowerCase() === "desc" ? "DESC" : "ASC";
        const orderMap = {
            name: ["name", orderDir],
            code: ["code", orderDir],
            parent: ["parent_id", orderDir],
        };
        const order = [orderMap[sortBy] || orderMap.name, ["name", "ASC"]];
        const trimmedSearch = String(search || "").trim();
        const where = includeDeleted ? {} : { deleted_at: null };
        if (trimmedSearch) {
            where[Op.or] = [
                { name: { [Op.like]: `%${trimmedSearch}%` } },
                { code: { [Op.like]: `%${trimmedSearch}%` } },
            ];
        }
        const { rows, count } = await this.Department.findAndCountAll({
            where,
            limit: safeLimit,
            offset,
            order,
        });
        return {
            rows,
            total: Number(count) || 0,
            page: safePage,
            limit: safeLimit,
        };
    }

    async getById(id) {
        const dept = await this.Department.findOne({
            where: { id, deleted_at: null },
        });
        if (!dept) {
            const err = new Error("Department not found");
            err.statusCode = 404;
            throw err;
        }
        return dept;
    }

    async create(payload) {
        return this.Department.create(payload);
    }

    async update(id, payload) {
        const dept = await this.getById(id);
        dept.set(payload);
        await dept.save();
        return dept;
    }

    async softDelete(id) {
        const dept = await this.getById(id);
        dept.deleted_at = new Date();
        await dept.save();
        return { success: true };
    }

    async options() {
        const departments = await this.Department.findAll({
            where: { deleted_at: null },
            attributes: ["id", "name"],
            order: [["name", "ASC"]],
        });
        return departments;
    }

    normalizeAvatarPath(member) {
        if (!member || !member.avatar_path || !env.BASE_URL) return member;
        if (/^https?:\/\//i.test(member.avatar_path)) return member;
        const base = String(env.BASE_URL).replace(/\/$/, "");
        const suffix = member.avatar_path.startsWith("/")
            ? member.avatar_path
            : `/${member.avatar_path}`;
        member.avatar_path = `${base}${suffix}`;
        return member;
    }

    async members(departmentId) {
        const members = await this.Member.findAll({
            where: {
                department_id: departmentId,
                [Op.or]: [
                    { designation: { [Op.is]: null } },
                    { designation: { [Op.eq]: "" } },
                    {
                        [Op.and]: [
                            Sequelize.where(
                                fn("LOWER", col("designation")),
                                { [Op.ne]: "vendor" }
                            ),
                        ],
                    },
                ],
            },
            attributes: [
                "id",
                "full_name",
                "email",
                "designation",
                "avatar_path",
                "phone",
            ],
            order: [["full_name", "ASC"]],
        });
        return members.map((member) => this.normalizeAvatarPath(member));
    }

    async stages(departmentId) {
        const stages = await this.ProjectStage.findAll({
            order: [["stage_order", "ASC"]],
        });
        return stages.map((stage) => stage.toJSON());
    }

    async vendors(departmentId) {
        const vendors = await this.Member.findAll({
            where: {
                department_id: departmentId,
                [Op.and]: [
                    Sequelize.where(fn("LOWER", col("designation")), "vendor"),
                ],
            },
            attributes: ["id", "full_name", "email", "designation"],
            order: [["full_name", "ASC"]],
        });
        return vendors;
    }
}

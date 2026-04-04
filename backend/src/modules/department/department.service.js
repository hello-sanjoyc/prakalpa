import { Sequelize, Op, fn, col } from "sequelize";
import crypto from "crypto";
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

    md5(value) {
        return crypto.createHash("md5").update(String(value)).digest("hex");
    }

    isMd5Hash(value) {
        return /^[a-f0-9]{32}$/i.test(String(value || ""));
    }

    toComparableMd5(value) {
        const normalized = String(value || "").trim();
        if (!normalized) {
            const err = new Error("Invalid id");
            err.statusCode = 400;
            throw err;
        }
        return this.isMd5Hash(normalized)
            ? normalized.toLowerCase()
            : this.md5(normalized);
    }

    isIdField(key) {
        return key === "id" || key.endsWith("_id");
    }

    hashIdFields(data) {
        if (Array.isArray(data)) return data.map((item) => this.hashIdFields(item));
        if (!data || typeof data !== "object") return data;
        if (data instanceof Date) return data;

        const source = typeof data.toJSON === "function" ? data.toJSON() : data;
        const out = {};
        for (const [key, value] of Object.entries(source)) {
            if (value === null || value === undefined) {
                out[key] = value;
                continue;
            }
            if (
                this.isIdField(key) &&
                ["string", "number", "bigint"].includes(typeof value)
            ) {
                out[key] = this.md5(value);
                continue;
            }
            out[key] = this.hashIdFields(value);
        }
        return out;
    }

    async resolveRawDepartmentId(idOrHash) {
        if (idOrHash === null || idOrHash === undefined || idOrHash === "") {
            return null;
        }
        if (typeof idOrHash === "number") return idOrHash;

        const normalized = String(idOrHash).trim();
        if (/^\d+$/.test(normalized)) return Number(normalized);

        const hashValue = this.toComparableMd5(normalized);
        const department = await this.Department.findOne({
            attributes: ["id"],
            where: Sequelize.where(fn("MD5", col("id")), hashValue),
        });
        if (!department) {
            const err = new Error("Invalid parent_id");
            err.statusCode = 400;
            throw err;
        }
        return department.id;
    }

    async normalizeDepartmentPayload(payload) {
        if (!payload || !Object.prototype.hasOwnProperty.call(payload, "parent_id")) {
            return payload;
        }
        const normalized = { ...payload };
        normalized.parent_id = await this.resolveRawDepartmentId(payload.parent_id);
        return normalized;
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
            rows: this.hashIdFields(rows),
            total: Number(count) || 0,
            page: safePage,
            limit: safeLimit,
        };
    }

    async getById(idHash) {
        const comparableHash = this.toComparableMd5(idHash);
        const dept = await this.Department.findOne({
            where: {
                [Op.and]: [
                    { deleted_at: null },
                    Sequelize.where(fn("MD5", col("id")), comparableHash),
                ],
            },
        });
        if (!dept) {
            const err = new Error("Department not found");
            err.statusCode = 404;
            throw err;
        }
        return this.hashIdFields(dept);
    }

    async create(payload) {
        const normalizedPayload = await this.normalizeDepartmentPayload(payload);
        const department = await this.Department.create(normalizedPayload);
        return this.hashIdFields(department);
    }

    async update(idHash, payload) {
        const comparableHash = this.toComparableMd5(idHash);
        const dept = await this.Department.findOne({
            where: {
                [Op.and]: [
                    { deleted_at: null },
                    Sequelize.where(fn("MD5", col("id")), comparableHash),
                ],
            },
        });
        if (!dept) {
            const err = new Error("Department not found");
            err.statusCode = 404;
            throw err;
        }
        const normalizedPayload = await this.normalizeDepartmentPayload(payload);
        dept.set(normalizedPayload);
        await dept.save();
        return this.hashIdFields(dept);
    }

    async softDelete(idHash) {
        const comparableHash = this.toComparableMd5(idHash);
        const dept = await this.Department.findOne({
            where: {
                [Op.and]: [
                    { deleted_at: null },
                    Sequelize.where(fn("MD5", col("id")), comparableHash),
                ],
            },
        });
        if (!dept) {
            const err = new Error("Department not found");
            err.statusCode = 404;
            throw err;
        }
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
        return this.hashIdFields(departments);
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

    async members(departmentIdHash) {
        const comparableHash = this.toComparableMd5(departmentIdHash);
        const members = await this.Member.findAll({
            where: {
                [Op.and]: [
                    Sequelize.where(fn("MD5", col("department_id")), comparableHash),
                    {
                        [Op.or]: [
                            { designation: { [Op.is]: null } },
                            { designation: { [Op.eq]: "" } },
                            {
                                [Op.and]: [
                                    Sequelize.where(fn("LOWER", col("designation")), {
                                        [Op.ne]: "vendor",
                                    }),
                                ],
                            },
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
        return this.hashIdFields(
            members.map((member) => this.normalizeAvatarPath(member))
        );
    }

    async stages(departmentIdHash) {
        await this.getById(departmentIdHash);
        const stages = await this.ProjectStage.findAll({
            order: [["stage_order", "ASC"]],
        });
        return this.hashIdFields(stages.map((stage) => stage.toJSON()));
    }

    async vendors(departmentIdHash) {
        const comparableHash = this.toComparableMd5(departmentIdHash);
        const vendors = await this.Member.findAll({
            where: {
                [Op.and]: [
                    Sequelize.where(fn("MD5", col("department_id")), comparableHash),
                    Sequelize.where(fn("LOWER", col("designation")), "vendor"),
                ],
            },
            attributes: ["id", "full_name", "email", "designation"],
            order: [["full_name", "ASC"]],
        });
        return this.hashIdFields(vendors);
    }
}

import { Op, Sequelize, fn, col } from "sequelize";
import initModels from "../../models/index.js";
import { env } from "../../config/index.js";
import {
    hashIdFields,
    resolveIdFromModel,
} from "../../lib/id-hash.js";

export default class ProjectMemberRoleService {
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
        this.ProjectMemberRole = models.ProjectMemberRole;
        this.Project = models.Project;
    }

    async list(projectId) {
        const projectValue = await resolveIdFromModel(
            this.Project,
            projectId,
            "project_id",
        );
        const roles = await this.ProjectMemberRole.findAll({
            where: { project_id: projectValue },
            order: [["name", "ASC"]],
        });
        return hashIdFields(roles);
    }

    async create(payload = {}) {
        const name = String(payload.name || "").trim();
        const projectId = await resolveIdFromModel(
            this.Project,
            payload?.project_id,
            "project_id",
        );
        if (!name) {
            const err = new Error("Role name is required");
            err.statusCode = 400;
            throw err;
        }
        const existing = await this.ProjectMemberRole.findOne({
            where: {
                project_id: projectId,
                [Op.and]: [
                    Sequelize.where(
                        fn("LOWER", col("name")),
                        name.toLowerCase()
                    ),
                ],
            },
        });
        if (existing) {
            const err = new Error("Role already exists");
            err.statusCode = 409;
            throw err;
        }
        const role = await this.ProjectMemberRole.create({
            name,
            project_id: projectId,
        });
        return hashIdFields(role);
    }
}

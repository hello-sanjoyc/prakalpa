import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Sequelize, QueryTypes } from "sequelize";
import initModels from "../../models/index.js";
import { env } from "../../config/index.js";
import logger from "../../config/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.resolve(__dirname, "..", "..", "..", "upload");
const uploadPrefix = "/upload/";

function sanitizeProjectPayload(payload) {
    const cleaned = { ...payload };
    const dateFields = [
        "start_date",
        "end_date",
        "revised_start_date",
        "revised_end_date",
        "actual_start_date",
        "actual_end_date",
    ];
    dateFields.forEach((field) => {
        const value = cleaned[field];
        if (!value || value === "Invalid date") {
            cleaned[field] = null;
        }
    });
    if (cleaned.version === "" || cleaned.version === null) {
        delete cleaned.version;
    }
    return cleaned;
}

export default class ProjectService {
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
        this.Project = models.Project;
        this.Department = models.Department;
        this.User = models.User;
        this.Member = models.Member;
        this.ProjectStage = models.ProjectStage;
        this.ProjectMember = models.ProjectMember;
        this.ProjectMemberRole = models.ProjectMemberRole;
        this.Milestone = models.Milestone;
        this.ProjectFile = models.ProjectFile;
        this.ProjectFinance = models.ProjectFinance;
        this.Task = models.Task;
        this.Action = models.Action;
    }

    logError(method, err) {
        logger.error(`[ProjectService] ${method} failed`, {
            message: err?.message,
            stack: err?.stack,
        });
    }

    resolveDiskPath(filePath) {
        const normalized = String(filePath || "").trim();
        if (!normalized) return null;
        const relative = normalized.startsWith(uploadPrefix)
            ? normalized.slice(uploadPrefix.length)
            : normalized.replace(/^\/+/, "");
        return path.join(uploadRoot, relative);
    }

    async generateUniqueProjectCode(transaction = null) {
        try {
            const maxAttempts = 10;
            for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
                const code = crypto
                    .randomBytes(4)
                    .toString("base64")
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .toUpperCase()
                    .slice(0, 6);
                if (code.length < 6) continue;
                const existing = await this.Project.findOne({
                    where: { code },
                    transaction,
                });
                if (!existing) return code;
            }
            const err = new Error("Failed to generate project code");
            err.statusCode = 500;
            throw err;
        } catch (err) {
            this.logError("generateUniqueProjectCode", err);
            throw err;
        }
    }

    async list({
        page = 1,
        limit = 25,
        sortBy = "title",
        sortOrder = "asc",
        search = "",
        member = null,
        includeDeleted = false,
    } = {}) {
        try {
            const safePage = Math.max(Number(page) || 1, 1);
            const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200);
            const offset = (safePage - 1) * safeLimit;
            const orderDir =
                String(sortOrder).toLowerCase() === "desc" ? "DESC" : "ASC";
            const sortMap = {
                title: "p.title",
                code: "p.code",
                department: "d.name",
                owner: "m.full_name",
                stage: "s.stage_slug",
                budget: "p.budget",
            };
            const orderBy = sortMap[sortBy] || sortMap.title;
            const trimmedSearch = String(search || "").trim();
            const likeSearch = trimmedSearch ? `%${trimmedSearch}%` : null;
            const whereClauseParts = [];
            if (!includeDeleted) {
                whereClauseParts.push("p.deleted_at IS NULL");
            }
            if (member) {
                whereClauseParts.push(
                    `(pm.member_id = :memberId OR u.member_id = :memberId)`,
                );
            }
            if (trimmedSearch) {
                whereClauseParts.push(
                    `(p.title LIKE :search OR p.code LIKE :search OR d.name LIKE :search OR m.full_name LIKE :search OR s.stage_slug LIKE :search)`,
                );
            }
            const whereClause = whereClauseParts.length
                ? `WHERE ${whereClauseParts.join(" AND ")}`
                : "";

            const joinClause = member
                ? "LEFT JOIN project_members pm ON pm.project_id = p.id"
                : "";

            const rowsSql = `
            SELECT
                p.*,
                d.name AS department_name,
                d.id AS department_id,
                m.full_name AS owner_name,
                u.id AS owner_id,
                s.id AS stage_id,
                s.stage_slug AS stage_slug,
                s.stage_order AS stage_order
            FROM projects p
            LEFT JOIN departments d ON d.id = p.department_id
            LEFT JOIN users u ON u.id = p.owner_id
            ${joinClause}
            LEFT JOIN members m ON m.id = u.member_id
            LEFT JOIN project_stages s ON s.id = p.current_stage_id
            ${whereClause}
            ORDER BY ${orderBy} ${orderDir}, p.created_at DESC
            LIMIT :limit OFFSET :offset
            `;

            //console.log("[SQL][projects rows]:", rowsSql);

            const rows =
                (await this.sequelize.query(rowsSql, {
                    type: QueryTypes.SELECT,
                    replacements: {
                        limit: safeLimit,
                        offset,
                        ...(likeSearch ? { search: likeSearch } : {}),
                        ...(member ? { memberId: Number(member) } : {}),
                    },
                })) || [];

            const countSql = `
            SELECT COUNT(DISTINCT p.id) AS total
            FROM projects p
            LEFT JOIN departments d ON d.id = p.department_id
            LEFT JOIN users u ON u.id = p.owner_id
            ${joinClause}
            LEFT JOIN members m ON m.id = u.member_id
            LEFT JOIN project_stages s ON s.id = p.current_stage_id
            ${whereClause}
            `;

            const [{ total = 0 } = {}] =
                (await this.sequelize.query(countSql, {
                    type: QueryTypes.SELECT,
                    replacements: {
                        ...(likeSearch ? { search: likeSearch } : {}),
                        ...(member ? { memberId: Number(member) } : {}),
                    },
                })) || [];

            return {
                rows,
                total: Number(total) || 0,
                page: safePage,
                limit: safeLimit,
            };
        } catch (err) {
            this.logError("list", err);
            throw err;
        }
    }

    async getById(id) {
        try {
            const project = await this.Project.findOne({
                where: { id, deleted_at: null },
                include: [
                    {
                        model: this.Department,
                        as: "department",
                        attributes: ["id", "name"],
                    },
                    {
                        model: this.User,
                        as: "owner",
                        attributes: ["id", "member_id"],
                        include: [
                            {
                                model: this.Member,
                                as: "member",
                                attributes: ["id", "full_name"],
                            },
                        ],
                    },
                    {
                        model: this.ProjectStage,
                        as: "currentStage",
                        attributes: ["id", "stage_slug", "stage_order"],
                    },
                    {
                        model: this.ProjectMember,
                        as: "projectMembers",
                        attributes: ["id", "member_id", "role"],
                        include: [
                            {
                                model: this.Member,
                                as: "member",
                                attributes: [
                                    "id",
                                    "full_name",
                                    "email",
                                    "designation",
                                    "phone",
                                    "avatar_path",
                                ],
                            },
                        ],
                    },
                ],
            });
            if (!project) {
                const err = new Error("Project not found");
                err.statusCode = 404;
                throw err;
            }
            const members = project.projectMembers || [];
            if (env.BASE_URL && members.length) {
                const base = String(env.BASE_URL).replace(/\/$/, "");
                members.forEach((entry) => {
                    const member = entry?.member;
                    if (!member?.avatar_path) return;
                    if (/^https?:\/\//i.test(member.avatar_path)) return;
                    const suffix = member.avatar_path.startsWith("/")
                        ? member.avatar_path
                        : `/${member.avatar_path}`;
                    member.avatar_path = `${base}${suffix}`;
                });
            }
            const stages = await this.ProjectStage.findAll({
                order: [["stage_order", "ASC"]],
            });
            project.setDataValue("stages", stages);
            return project;
        } catch (err) {
            this.logError("getById", err);
            throw err;
        }
    }

    async create(payload) {
        try {
            const { project_members: projectMembers = [], ...rest } =
                payload || {};
            const project = await this.sequelize.transaction(async (t) => {
                const code = await this.generateUniqueProjectCode(t);
                const created = await this.Project.create(
                    sanitizeProjectPayload({ ...rest, code }),
                    { transaction: t },
                );

                if (!rest.current_stage_id) {
                    const firstStage = await this.ProjectStage.findOne({
                        where: { stage_order: 1 },
                        transaction: t,
                    });
                    if (firstStage) {
                        created.current_stage_id = firstStage.id;
                        await created.save({ transaction: t });
                    }
                }

                const validMembers = Array.isArray(projectMembers)
                    ? projectMembers
                          .map((item) => ({
                              member_id: Number(item.member_id) || 0,
                              role: String(item.role || "").trim(),
                          }))
                          .filter((item) => item.member_id && item.role)
                    : [];

                if (validMembers.length) {
                    const roleNames = [
                        ...new Set(validMembers.map((item) => item.role)),
                    ];
                    const existingRoles = await this.ProjectMemberRole.findAll({
                        where: { project_id: created.id, name: roleNames },
                        transaction: t,
                    });
                    const existingNames = new Set(
                        existingRoles.map((role) => role.name),
                    );
                    const missingNames = roleNames.filter(
                        (name) => !existingNames.has(name),
                    );
                    if (missingNames.length) {
                        await this.ProjectMemberRole.bulkCreate(
                            missingNames.map((name) => ({
                                name,
                                project_id: created.id,
                            })),
                            { transaction: t },
                        );
                    }

                    await this.ProjectMember.bulkCreate(
                        validMembers.map((member) => ({
                            project_id: created.id,
                            member_id: member.member_id,
                            role: member.role,
                        })),
                        { transaction: t },
                    );
                }

                return created;
            });

            return project;
        } catch (err) {
            this.logError("create", err);
            throw err;
        }
    }

    async update(id, payload) {
        try {
            const {
                project_members: projectMembers,
                vendor_ids: vendorIds,
                ...rest
            } = payload || {};
            const project = await this.sequelize.transaction(async (t) => {
                const existing = await this.Project.findOne({
                    where: { id, deleted_at: null },
                    transaction: t,
                });
                if (!existing) {
                    const err = new Error("Project not found");
                    err.statusCode = 404;
                    throw err;
                }
                existing.set(sanitizeProjectPayload(rest));
                await existing.save({ transaction: t });

                if (projectMembers || vendorIds) {
                    await this.ProjectMember.destroy({
                        where: { project_id: existing.id },
                        transaction: t,
                    });
                    const validMembers = Array.isArray(projectMembers)
                        ? projectMembers
                              .map((item) => ({
                                  member_id: Number(item.member_id) || 0,
                                  role: String(item.role || "").trim(),
                              }))
                              .filter((item) => item.member_id && item.role)
                        : [];
                    const normalizedVendorIds = Array.isArray(vendorIds)
                        ? vendorIds
                              .map((value) => Number(value))
                              .filter((value) => value)
                        : [];
                    const memberIdSet = new Set(
                        validMembers.map((item) => String(item.member_id)),
                    );
                    const vendorMembers = normalizedVendorIds
                        .filter((value) => !memberIdSet.has(String(value)))
                        .map((value) => ({
                            member_id: value,
                            role: "VENDOR",
                        }));

                    if (validMembers.length) {
                        const roleNames = [
                            ...new Set(
                                validMembers
                                    .map((item) => item.role)
                                    .filter((name) => name !== "VENDOR"),
                            ),
                        ];
                        if (roleNames.length) {
                            const existingRoles =
                                await this.ProjectMemberRole.findAll({
                                    where: {
                                        project_id: existing.id,
                                        name: roleNames,
                                    },
                                    transaction: t,
                                });
                            const existingNames = new Set(
                                existingRoles.map((role) => role.name),
                            );
                            const missingNames = roleNames.filter(
                                (name) => !existingNames.has(name),
                            );
                            if (missingNames.length) {
                                await this.ProjectMemberRole.bulkCreate(
                                    missingNames.map((name) => ({
                                        name,
                                        project_id: existing.id,
                                    })),
                                    { transaction: t },
                                );
                            }
                        }
                    }

                    const combinedMembers = [...validMembers, ...vendorMembers];
                    if (combinedMembers.length) {
                        await this.ProjectMember.bulkCreate(
                            combinedMembers.map((member) => ({
                                project_id: existing.id,
                                member_id: member.member_id,
                                role: member.role,
                            })),
                            { transaction: t },
                        );
                    }
                }

                return existing;
            });
            return project;
        } catch (err) {
            this.logError("update", err);
            throw err;
        }
    }

    async softDelete(id) {
        try {
            const project = await this.getById(id);
            project.deleted_at = new Date();
            await project.save();
            return { success: true };
        } catch (err) {
            this.logError("softDelete", err);
            throw err;
        }
    }

    async listMilestones({
        projectId,
        page = 1,
        limit = 25,
        sortBy = "title",
        sortOrder = "asc",
        search = "",
    } = {}) {
        try {
            const safePage = Math.max(Number(page) || 1, 1);
            const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200);
            const offset = (safePage - 1) * safeLimit;
            const orderDir =
                String(sortOrder).toLowerCase() === "desc" ? "DESC" : "ASC";
            const sortMap = {
                title: "title",
                status: "status",
                due_date: "due_date",
            };
            const orderBy = sortMap[sortBy] || sortMap.title;
            const trimmedSearch = String(search || "").trim();
            const where = {
                project_id: Number(projectId),
            };
            where.deleted_at = null;
            where.deleted_at = null;
            if (trimmedSearch) {
                where[Sequelize.Op.or] = [
                    { title: { [Sequelize.Op.like]: `%${trimmedSearch}%` } },
                    { status: { [Sequelize.Op.like]: `%${trimmedSearch}%` } },
                ];
            }
            const { rows, count } = await this.Milestone.findAndCountAll({
                where,
                order: [[orderBy, orderDir]],
                limit: safeLimit,
                offset,
            });
            return {
                rows,
                total: Number(count) || 0,
                page: safePage,
                limit: safeLimit,
            };
        } catch (err) {
            this.logError("listMilestones", err);
            throw err;
        }
    }

    async listMembers({ projectId, excludeMemberId = null } = {}) {
        try {
            if (!projectId) return [];
            const rowsSql = `
            SELECT
                m.id,
                m.full_name,
                m.email,
                m.designation,
                m.avatar_path,
                pm.role AS project_role
            FROM project_members pm
            JOIN members m ON m.id = pm.member_id
            JOIN projects p ON p.id = pm.project_id
            WHERE pm.project_id = :projectId
              AND p.deleted_at IS NULL
              ${excludeMemberId ? "AND m.id <> :excludeMemberId" : ""}
            ORDER BY m.full_name ASC
            `;

            const rows =
                (await this.sequelize.query(rowsSql, {
                    type: QueryTypes.SELECT,
                    replacements: {
                        projectId: Number(projectId),
                        ...(excludeMemberId
                            ? { excludeMemberId: Number(excludeMemberId) }
                            : {}),
                    },
                })) || [];

            const normalized = rows.map((r) => {
                if (env.BASE_URL && r.avatar_path) {
                    const base = String(env.BASE_URL).replace(/\/$/, "");
                    const suffix = r.avatar_path.startsWith("/")
                        ? r.avatar_path
                        : `/${r.avatar_path}`;
                    r.avatar_path = `${base}${suffix}`;
                }
                return r;
            });
            return normalized;
        } catch (err) {
            this.logError("listMembers", err);
            throw err;
        }
    }

    async softDeleteProjectFile(projectId, fileId, deletedBy = null) {
        try {
            const file = await this.ProjectFile.findOne({
                where: {
                    id: Number(fileId),
                    project_id: Number(projectId),
                    deleted_at: null,
                },
            });
            if (!file) {
                const err = new Error("File not found");
                err.statusCode = 404;
                throw err;
            }
            const deletedAt = new Date();
            file.deleted_at = deletedAt;
            if (deletedBy) {
                file.uploaded_by = file.uploaded_by || deletedBy;
            }
            await file.save();

            if (file.is_folder) {
                await this.ProjectFile.update(
                    { deleted_at: deletedAt },
                    {
                        where: {
                            project_id: Number(projectId),
                            path: { [Sequelize.Op.like]: `${file.path}/%` },
                            deleted_at: null,
                        },
                    },
                );
            }
            return { success: true };
        } catch (err) {
            this.logError("softDeleteProjectFile", err);
            throw err;
        }
    }

    async createMilestone(projectId, payload = {}) {
        try {
            const title = String(payload.title || "").trim();
            if (!title) {
                const err = new Error("Milestone title is required");
                err.statusCode = 400;
                throw err;
            }
            await this.getById(projectId);
            return this.Milestone.create({
                project_id: Number(projectId),
                title,
                due_date: payload.due_date || null,
                status: payload.status || "PENDING",
            });
        } catch (err) {
            this.logError("createMilestone", err);
            throw err;
        }
    }

    async updateMilestone(projectId, milestoneId, payload = {}) {
        try {
            const milestone = await this.Milestone.findOne({
                where: {
                    id: Number(milestoneId),
                    project_id: Number(projectId),
                },
            });
            if (!milestone) {
                const err = new Error("Milestone not found");
                err.statusCode = 404;
                throw err;
            }
            const updates = {};
            if (Object.prototype.hasOwnProperty.call(payload, "title")) {
                const title = String(payload.title || "").trim();
                if (!title) {
                    const err = new Error("Milestone title is required");
                    err.statusCode = 400;
                    throw err;
                }
                updates.title = title;
            }
            if (Object.prototype.hasOwnProperty.call(payload, "due_date")) {
                updates.due_date = payload.due_date || null;
            }
            if (Object.prototype.hasOwnProperty.call(payload, "status")) {
                updates.status = payload.status;
            }
            if (!Object.keys(updates).length) {
                return milestone;
            }
            await milestone.update(updates);
            return milestone;
        } catch (err) {
            this.logError("updateMilestone", err);
            throw err;
        }
    }

    async deleteMilestone(projectId, milestoneId) {
        try {
            const milestone = await this.Milestone.findOne({
                where: {
                    id: Number(milestoneId),
                    project_id: Number(projectId),
                },
            });
            if (!milestone) {
                const err = new Error("Milestone not found");
                err.statusCode = 404;
                throw err;
            }
            const deletedAt = new Date();
            milestone.deleted_at = deletedAt;
            await milestone.save();
            await this.Task.update(
                { deleted_at: deletedAt },
                {
                    where: {
                        milestone_id: milestone.id,
                        deleted_at: null,
                    },
                },
            );
            return { success: true };
        } catch (err) {
            this.logError("deleteMilestone", err);
            throw err;
        }
    }

    async listTasks({
        projectId,
        page = 1,
        limit = 25,
        sortBy = "title",
        sortOrder = "asc",
        search = "",
    } = {}) {
        try {
            const safePage = Math.max(Number(page) || 1, 1);
            const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200);
            const offset = (safePage - 1) * safeLimit;
            const orderDir =
                String(sortOrder).toLowerCase() === "desc" ? "DESC" : "ASC";
            const sortMap = {
                title: "t.title",
                status: "t.status",
                due_date: "t.due_date",
                milestone: "m.title",
            };
            const orderBy = sortMap[sortBy] || sortMap.title;
            const trimmedSearch = String(search || "").trim();
            const whereClause = trimmedSearch
                ? `AND (t.title LIKE :search OR t.status LIKE :search OR m.title LIKE :search)`
                : "";
            const rows =
                (await this.sequelize.query(
                    `
            SELECT
                t.*,
                m.id AS milestone_id,
                m.title AS milestone_title
            FROM tasks t
            JOIN milestones m ON m.id = t.milestone_id
            WHERE m.project_id = :projectId
            AND m.deleted_at IS NULL
            AND t.deleted_at IS NULL
            ${whereClause}
            ORDER BY ${orderBy} ${orderDir}, t.created_at DESC
            LIMIT :limit OFFSET :offset
            `,
                    {
                        type: QueryTypes.SELECT,
                        replacements: {
                            projectId: Number(projectId),
                            limit: safeLimit,
                            offset,
                            ...(trimmedSearch
                                ? { search: `%${trimmedSearch}%` }
                                : {}),
                        },
                    },
                )) || [];

            const [{ total = 0 } = {}] =
                (await this.sequelize.query(
                    `
            SELECT COUNT(DISTINCT t.id) AS total
            FROM tasks t
            JOIN milestones m ON m.id = t.milestone_id
            WHERE m.project_id = :projectId
            AND m.deleted_at IS NULL
            AND t.deleted_at IS NULL
            ${whereClause}
            `,
                    {
                        type: QueryTypes.SELECT,
                        replacements: {
                            projectId: Number(projectId),
                            ...(trimmedSearch
                                ? { search: `%${trimmedSearch}%` }
                                : {}),
                        },
                    },
                )) || [];

            return {
                rows,
                total: Number(total) || 0,
                page: safePage,
                limit: safeLimit,
            };
        } catch (err) {
            this.logError("listTasks", err);
            throw err;
        }
    }

    async getTaskDashboardSummary({
        projectId = null,
        memberId = null,
        memberScope = null,
        status = null,
        priority = null,
        authUserId = null,
    } = {}) {
        try {
            const [authUser] =
                (await this.sequelize.query(
                    `
                SELECT member_id
                FROM users
                WHERE id = :userId
                LIMIT 1
                `,
                    {
                        type: QueryTypes.SELECT,
                        replacements: { userId: Number(authUserId) || 0 },
                    },
                )) || [];
            const authMemberId = Number(authUser?.member_id) || 0;
            if (!authMemberId) {
                return {
                    open: 0,
                    in_progress: 0,
                    blocked: 0,
                    done: 0,
                    total: 0,
                };
            }

            const whereParts = [
                "t.deleted_at IS NULL",
                "m.deleted_at IS NULL",
                "p.deleted_at IS NULL",
            ];
            const replacements = {};
            const safeProjectId = Number(projectId) || 0;
            if (safeProjectId > 0) {
                whereParts.push("m.project_id = :projectId");
                replacements.projectId = safeProjectId;
            } else {
                whereParts.push(
                    `EXISTS (
                        SELECT 1
                        FROM project_members pm_scope
                        WHERE pm_scope.project_id = m.project_id
                          AND pm_scope.member_id = :authMemberId
                    )`,
                );
                replacements.authMemberId = authMemberId;
            }

            const normalizedStatus = String(status || "").toUpperCase().trim();
            if (normalizedStatus) {
                whereParts.push("t.status = :status");
                replacements.status = normalizedStatus;
            }

            const normalizedPriority = String(priority || "")
                .toUpperCase()
                .trim();
            if (normalizedPriority) {
                whereParts.push("t.priority = :priority");
                replacements.priority = normalizedPriority;
            }

            const safeMemberId = Number(memberId) || 0;
            if (safeMemberId > 0) {
                whereParts.push("t.owner_id = :memberId");
                replacements.memberId = safeMemberId;
            } else if (String(memberScope || "").toLowerCase() === "me") {
                whereParts.push("t.owner_id = :ownerMemberId");
                replacements.ownerMemberId = authMemberId;
            }

            const whereClause = whereParts.length
                ? `WHERE ${whereParts.join(" AND ")}`
                : "";

            const rows =
                (await this.sequelize.query(
                    `
                SELECT t.status, COUNT(*) AS total
                FROM tasks t
                JOIN milestones m ON m.id = t.milestone_id
                JOIN projects p ON p.id = m.project_id
                ${whereClause}
                GROUP BY t.status
                `,
                    {
                        type: QueryTypes.SELECT,
                        replacements,
                    },
                )) || [];

            const statusMap = new Map(
                rows.map((row) => [String(row.status || ""), Number(row.total) || 0]),
            );
            const open = statusMap.get("OPEN") || 0;
            const inProgress = statusMap.get("IN_PROGRESS") || 0;
            const blocked = statusMap.get("BLOCKED") || 0;
            const done = statusMap.get("DONE") || 0;

            return {
                open,
                in_progress: inProgress,
                blocked,
                done,
                total: open + inProgress + blocked + done,
            };
        } catch (err) {
            this.logError("getTaskDashboardSummary", err);
            throw err;
        }
    }

    async createTask(projectId, payload = {}) {
        try {
            const milestoneId = Number(payload.milestone_id);
            if (!milestoneId) {
                const err = new Error("Milestone is required");
                err.statusCode = 400;
                throw err;
            }
            const milestone = await this.Milestone.findOne({
                where: { id: milestoneId, project_id: Number(projectId) },
            });
            if (!milestone) {
                const err = new Error("Milestone not found");
                err.statusCode = 404;
                throw err;
            }
            const title = String(payload.title || "").trim();
            if (!title) {
                const err = new Error("Task title is required");
                err.statusCode = 400;
                throw err;
            }
            const ownerId =
                payload.owner_id === null || payload.owner_id === ""
                    ? null
                    : Number(payload.owner_id);
            if (payload.owner_id !== undefined && ownerId === 0) {
                const err = new Error("Owner is invalid");
                err.statusCode = 400;
                throw err;
            }
            if (ownerId) {
                const isProjectMember = await this.ProjectMember.findOne({
                    where: {
                        project_id: Number(projectId),
                        member_id: ownerId,
                    },
                });
                if (!isProjectMember) {
                    const err = new Error("Owner is not a project member");
                    err.statusCode = 400;
                    throw err;
                }
            }
            const priority =
                payload.priority &&
                ["LOW", "MEDIUM", "HIGH"].includes(payload.priority)
                    ? payload.priority
                    : "MEDIUM";
            return this.Task.create({
                milestone_id: milestoneId,
                title,
                description: payload.description || null,
                owner_id: ownerId,
                sla_hours: payload.sla_hours || null,
                due_date: payload.due_date || null,
                priority,
                status: payload.status || "OPEN",
            });
        } catch (err) {
            this.logError("createTask", err);
            throw err;
        }
    }

    async updateTask(projectId, taskId, payload = {}) {
        try {
            const task = await this.Task.findOne({
                where: { id: Number(taskId) },
            });
            if (!task) {
                const err = new Error("Task not found");
                err.statusCode = 404;
                throw err;
            }
            const currentMilestone = await this.Milestone.findOne({
                where: {
                    id: Number(task.milestone_id),
                    project_id: Number(projectId),
                },
            });
            if (!currentMilestone) {
                const err = new Error("Task not found");
                err.statusCode = 404;
                throw err;
            }
            const updates = {};
            if (Object.prototype.hasOwnProperty.call(payload, "milestone_id")) {
                const nextMilestoneId = Number(payload.milestone_id);
                if (!nextMilestoneId) {
                    const err = new Error("Milestone is required");
                    err.statusCode = 400;
                    throw err;
                }
                const milestone = await this.Milestone.findOne({
                    where: {
                        id: nextMilestoneId,
                        project_id: Number(projectId),
                    },
                });
                if (!milestone) {
                    const err = new Error("Milestone not found");
                    err.statusCode = 404;
                    throw err;
                }
                updates.milestone_id = nextMilestoneId;
            }
            if (Object.prototype.hasOwnProperty.call(payload, "title")) {
                const title = String(payload.title || "").trim();
                if (!title) {
                    const err = new Error("Task title is required");
                    err.statusCode = 400;
                    throw err;
                }
                updates.title = title;
            }
            if (Object.prototype.hasOwnProperty.call(payload, "description")) {
                updates.description = payload.description || null;
            }
            if (Object.prototype.hasOwnProperty.call(payload, "due_date")) {
                updates.due_date = payload.due_date || null;
            }
            if (Object.prototype.hasOwnProperty.call(payload, "priority")) {
                updates.priority =
                    payload.priority &&
                    ["LOW", "MEDIUM", "HIGH"].includes(payload.priority)
                        ? payload.priority
                        : "MEDIUM";
            }
            if (Object.prototype.hasOwnProperty.call(payload, "status")) {
                updates.status = payload.status;
            }
            if (Object.prototype.hasOwnProperty.call(payload, "owner_id")) {
                const ownerId =
                    payload.owner_id === null || payload.owner_id === ""
                        ? null
                        : Number(payload.owner_id);
                if (payload.owner_id !== undefined && ownerId === 0) {
                    const err = new Error("Owner is invalid");
                    err.statusCode = 400;
                    throw err;
                }
                if (ownerId) {
                    const isProjectMember = await this.ProjectMember.findOne({
                        where: {
                            project_id: Number(projectId),
                            member_id: ownerId,
                        },
                    });
                    if (!isProjectMember) {
                        const err = new Error("Owner is not a project member");
                        err.statusCode = 400;
                        throw err;
                    }
                }
                updates.owner_id = ownerId;
            }
            if (!Object.keys(updates).length) {
                return task;
            }
            await task.update(updates);
            return task;
        } catch (err) {
            this.logError("updateTask", err);
            throw err;
        }
    }

    async deleteTask(projectId, taskId) {
        try {
            const task = await this.Task.findOne({
                where: { id: Number(taskId) },
            });
            if (!task) {
                const err = new Error("Task not found");
                err.statusCode = 404;
                throw err;
            }
            const milestone = await this.Milestone.findOne({
                where: {
                    id: Number(task.milestone_id),
                    project_id: Number(projectId),
                },
            });
            if (!milestone) {
                const err = new Error("Task not found");
                err.statusCode = 404;
                throw err;
            }
            await task.destroy();
            return { success: true };
        } catch (err) {
            this.logError("deleteTask", err);
            throw err;
        }
    }

    async listActions({
        projectId,
        page = 1,
        limit = 25,
        sortBy = "title",
        sortOrder = "asc",
        search = "",
    } = {}) {
        try {
            const safePage = Math.max(Number(page) || 1, 1);
            const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200);
            const offset = (safePage - 1) * safeLimit;
            const orderDir =
                String(sortOrder).toLowerCase() === "desc" ? "DESC" : "ASC";
            const sortMap = {
                title: "a.title",
                status: "a.status",
                due_date: "a.due_date",
                task: "t.title",
            };
            const orderBy = sortMap[sortBy] || sortMap.title;
            const trimmedSearch = String(search || "").trim();
            const whereClause = trimmedSearch
                ? `AND (a.title LIKE :search OR a.status LIKE :search OR t.title LIKE :search OR m.title LIKE :search)`
                : "";
            const rows =
                (await this.sequelize.query(
                    `
            SELECT
                a.*,
                t.title AS task_title,
                m.title AS milestone_title
            FROM actions a
            JOIN tasks t ON t.id = a.task_id
            JOIN milestones m ON m.id = t.milestone_id
            WHERE m.project_id = :projectId
            ${whereClause}
            ORDER BY ${orderBy} ${orderDir}, a.created_at DESC
            LIMIT :limit OFFSET :offset
            `,
                    {
                        type: QueryTypes.SELECT,
                        replacements: {
                            projectId: Number(projectId),
                            limit: safeLimit,
                            offset,
                            ...(trimmedSearch
                                ? { search: `%${trimmedSearch}%` }
                                : {}),
                        },
                    },
                )) || [];

            const [{ total = 0 } = {}] =
                (await this.sequelize.query(
                    `
            SELECT COUNT(DISTINCT a.id) AS total
            FROM actions a
            JOIN tasks t ON t.id = a.task_id
            JOIN milestones m ON m.id = t.milestone_id
            WHERE m.project_id = :projectId
            ${whereClause}
            `,
                    {
                        type: QueryTypes.SELECT,
                        replacements: {
                            projectId: Number(projectId),
                            ...(trimmedSearch
                                ? { search: `%${trimmedSearch}%` }
                                : {}),
                        },
                    },
                )) || [];

            return {
                rows,
                total: Number(total) || 0,
                page: safePage,
                limit: safeLimit,
            };
        } catch (err) {
            this.logError("listActions", err);
            throw err;
        }
    }

    async listFinances({
        projectId,
        page = 1,
        limit = 25,
        sortBy = "entry_date",
        sortOrder = "desc",
        search = "",
    } = {}) {
        try {
            const safePage = Math.max(Number(page) || 1, 1);
            const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200);
            const offset = (safePage - 1) * safeLimit;
            const orderDir =
                String(sortOrder).toLowerCase() === "asc" ? "ASC" : "DESC";
            const sortMap = {
                entry_date: "entry_date",
                fund_allocated: "fund_allocated",
                fund_consumed: "fund_consumed",
                created_at: "created_at",
            };
            const orderBy = sortMap[sortBy] || sortMap.entry_date;
            const trimmedSearch = String(search || "").trim();
            const where = {
                project_id: Number(projectId),
                deleted_at: null,
            };
            if (trimmedSearch) {
                where.note = {
                    [Sequelize.Op.like]: `%${trimmedSearch}%`,
                };
            }
            const { rows, count } = await this.ProjectFinance.findAndCountAll({
                where,
                order: [[orderBy, orderDir]],
                limit: safeLimit,
                offset,
            });
            return {
                rows,
                total: Number(count) || 0,
                page: safePage,
                limit: safeLimit,
            };
        } catch (err) {
            this.logError("listFinances", err);
            throw err;
        }
    }

    async createFinance(projectId, payload = {}) {
        try {
            const entryDate = String(payload.entry_date || "").trim();
            if (!entryDate) {
                const err = new Error("Finance date is required");
                err.statusCode = 400;
                throw err;
            }
            const allocated = Number(payload.fund_allocated);
            if (!Number.isFinite(allocated)) {
                const err = new Error("Fund Allocated must be a number");
                err.statusCode = 400;
                throw err;
            }
            const consumed = Number(payload.fund_consumed);
            if (!Number.isFinite(consumed)) {
                const err = new Error("Fund Expenses must be a number");
                err.statusCode = 400;
                throw err;
            }
            if (allocated < 0 || consumed < 0) {
                const err = new Error("Amounts cannot be negative");
                err.statusCode = 400;
                throw err;
            }

            const project = await this.Project.findOne({
                where: { id: Number(projectId), deleted_at: null },
            });
            if (!project) {
                const err = new Error("Project not found");
                err.statusCode = 404;
                throw err;
            }
            const budget =
                project.budget === null || project.budget === undefined
                    ? null
                    : Number(project.budget);

            const [totals = {}] =
                (await this.ProjectFinance.findAll({
                    attributes: [
                        [
                            Sequelize.fn(
                                "SUM",
                                Sequelize.col("fund_allocated"),
                            ),
                            "total_allocated",
                        ],
                        [
                            Sequelize.fn("SUM", Sequelize.col("fund_consumed")),
                            "total_consumed",
                        ],
                    ],
                    where: {
                        project_id: Number(projectId),
                        deleted_at: null,
                    },
                    raw: true,
                })) || [];

            const totalAllocated =
                Number(totals.total_allocated || 0) + allocated;
            const totalConsumed = Number(totals.total_consumed || 0) + consumed;

            if (totalConsumed > totalAllocated) {
                const err = new Error(
                    "Total Fund Expenses should be less than or equal to Fund Allocated",
                );
                err.statusCode = 400;
                throw err;
            }
            if (Number.isFinite(budget) && totalAllocated > budget) {
                const err = new Error(
                    "Total Fund Allocated should be less than or equal to Budget",
                );
                err.statusCode = 400;
                throw err;
            }

            return this.sequelize.transaction(async (t) => {
                const finance = await this.ProjectFinance.create(
                    {
                        project_id: Number(projectId),
                        entry_date: entryDate,
                        fund_allocated: allocated,
                        fund_consumed: consumed,
                        note: payload.note || null,
                    },
                    { transaction: t },
                );
                await project.update(
                    {
                        fund_allocated: totalAllocated,
                        fund_consumed: totalConsumed,
                    },
                    { transaction: t },
                );
                return finance;
            });
        } catch (err) {
            this.logError("createFinance", err);
            throw err;
        }
    }

    async updateFinance(projectId, financeId, payload = {}) {
        try {
            const finance = await this.ProjectFinance.findOne({
                where: {
                    id: Number(financeId),
                    project_id: Number(projectId),
                    deleted_at: null,
                },
            });
            if (!finance) {
                const err = new Error("Finance entry not found");
                err.statusCode = 404;
                throw err;
            }

            const updates = {};
            if (Object.prototype.hasOwnProperty.call(payload, "entry_date")) {
                const entryDate = String(payload.entry_date || "").trim();
                if (!entryDate) {
                    const err = new Error("Finance date is required");
                    err.statusCode = 400;
                    throw err;
                }
                updates.entry_date = entryDate;
            }
            if (
                Object.prototype.hasOwnProperty.call(payload, "fund_allocated")
            ) {
                const allocated = Number(payload.fund_allocated);
                if (!Number.isFinite(allocated)) {
                    const err = new Error("Fund Allocated must be a number");
                    err.statusCode = 400;
                    throw err;
                }
                if (allocated < 0) {
                    const err = new Error("Amounts cannot be negative");
                    err.statusCode = 400;
                    throw err;
                }
                updates.fund_allocated = allocated;
            }
            if (
                Object.prototype.hasOwnProperty.call(payload, "fund_consumed")
            ) {
                const consumed = Number(payload.fund_consumed);
                if (!Number.isFinite(consumed)) {
                    const err = new Error("Fund Expenses must be a number");
                    err.statusCode = 400;
                    throw err;
                }
                if (consumed < 0) {
                    const err = new Error("Amounts cannot be negative");
                    err.statusCode = 400;
                    throw err;
                }
                updates.fund_consumed = consumed;
            }
            if (Object.prototype.hasOwnProperty.call(payload, "note")) {
                updates.note = payload.note || null;
            }
            if (!Object.keys(updates).length) {
                return finance;
            }

            const project = await this.Project.findOne({
                where: { id: Number(projectId), deleted_at: null },
            });
            if (!project) {
                const err = new Error("Project not found");
                err.statusCode = 404;
                throw err;
            }
            const budget =
                project.budget === null || project.budget === undefined
                    ? null
                    : Number(project.budget);

            const [totals = {}] =
                (await this.ProjectFinance.findAll({
                    attributes: [
                        [
                            Sequelize.fn(
                                "SUM",
                                Sequelize.col("fund_allocated"),
                            ),
                            "total_allocated",
                        ],
                        [
                            Sequelize.fn("SUM", Sequelize.col("fund_consumed")),
                            "total_consumed",
                        ],
                    ],
                    where: {
                        project_id: Number(projectId),
                        deleted_at: null,
                    },
                    raw: true,
                })) || [];

            const currentAllocated = Number(totals.total_allocated || 0);
            const currentConsumed = Number(totals.total_consumed || 0);
            const nextAllocated =
                currentAllocated -
                Number(finance.fund_allocated || 0) +
                Number(updates.fund_allocated ?? finance.fund_allocated ?? 0);
            const nextConsumed =
                currentConsumed -
                Number(finance.fund_consumed || 0) +
                Number(updates.fund_consumed ?? finance.fund_consumed ?? 0);

            if (nextConsumed > nextAllocated) {
                const err = new Error(
                    "Total Fund Expenses should be less than or equal to Fund Allocated",
                );
                err.statusCode = 400;
                throw err;
            }
            if (Number.isFinite(budget) && nextAllocated > budget) {
                const err = new Error(
                    "Total Fund Allocated should be less than or equal to Budget",
                );
                err.statusCode = 400;
                throw err;
            }

            return this.sequelize.transaction(async (t) => {
                await finance.update(updates, { transaction: t });
                await project.update(
                    {
                        fund_allocated: nextAllocated,
                        fund_consumed: nextConsumed,
                    },
                    { transaction: t },
                );
                return finance;
            });
        } catch (err) {
            this.logError("updateFinance", err);
            throw err;
        }
    }

    async deleteFinance(projectId, financeId) {
        try {
            const finance = await this.ProjectFinance.findOne({
                where: {
                    id: Number(financeId),
                    project_id: Number(projectId),
                    deleted_at: null,
                },
            });
            if (!finance) {
                const err = new Error("Finance entry not found");
                err.statusCode = 404;
                throw err;
            }
            const project = await this.Project.findOne({
                where: { id: Number(projectId), deleted_at: null },
            });
            if (!project) {
                const err = new Error("Project not found");
                err.statusCode = 404;
                throw err;
            }

            const [totals = {}] =
                (await this.ProjectFinance.findAll({
                    attributes: [
                        [
                            Sequelize.fn(
                                "SUM",
                                Sequelize.col("fund_allocated"),
                            ),
                            "total_allocated",
                        ],
                        [
                            Sequelize.fn("SUM", Sequelize.col("fund_consumed")),
                            "total_consumed",
                        ],
                    ],
                    where: {
                        project_id: Number(projectId),
                        deleted_at: null,
                    },
                    raw: true,
                })) || [];

            const currentAllocated = Number(totals.total_allocated || 0);
            const currentConsumed = Number(totals.total_consumed || 0);
            const nextAllocated =
                currentAllocated - Number(finance.fund_allocated || 0);
            const nextConsumed =
                currentConsumed - Number(finance.fund_consumed || 0);

            return this.sequelize.transaction(async (t) => {
                await finance.update(
                    { deleted_at: new Date() },
                    { transaction: t },
                );
                await project.update(
                    {
                        fund_allocated: Math.max(nextAllocated, 0),
                        fund_consumed: Math.max(nextConsumed, 0),
                    },
                    { transaction: t },
                );
                return { success: true };
            });
        } catch (err) {
            this.logError("deleteFinance", err);
            throw err;
        }
    }

    async createAction(projectId, payload = {}) {
        try {
            const taskId = Number(payload.task_id);
            if (!taskId) {
                const err = new Error("Task is required");
                err.statusCode = 400;
                throw err;
            }
            const task = await this.sequelize.query(
                `
        SELECT t.id
        FROM tasks t
        JOIN milestones m ON m.id = t.milestone_id
        WHERE t.id = :taskId AND m.project_id = :projectId
        LIMIT 1
        `,
                {
                    type: QueryTypes.SELECT,
                    replacements: { taskId, projectId: Number(projectId) },
                },
            );
            if (!task.length) {
                const err = new Error("Task not found");
                err.statusCode = 404;
                throw err;
            }
            const title = String(payload.title || "").trim();
            if (!title) {
                const err = new Error("Activity title is required");
                err.statusCode = 400;
                throw err;
            }
            return this.Action.create({
                task_id: taskId,
                title,
                owner_id: payload.owner_id || null,
                due_date: payload.due_date || null,
                status: payload.status || "OPEN",
            });
        } catch (err) {
            this.logError("createAction", err);
            throw err;
        }
    }

    async listProjectFiles({
        projectId,
        page = 1,
        limit = 25,
        search = "",
        parentId = null,
    } = {}) {
        try {
            const safePage = Math.max(Number(page) || 1, 1);
            const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200);
            const offset = (safePage - 1) * safeLimit;
            const trimmedSearch = String(search || "").trim();
            const where = {
                project_id: Number(projectId),
                deleted_at: null,
            };
            if (
                parentId === null ||
                parentId === undefined ||
                parentId === "" ||
                parentId === "null"
            ) {
                where.parent_id = null;
            } else {
                where.parent_id = Number(parentId);
            }
            if (trimmedSearch) {
                where[Sequelize.Op.or] = [
                    { name: { [Sequelize.Op.like]: `%${trimmedSearch}%` } },
                    { path: { [Sequelize.Op.like]: `%${trimmedSearch}%` } },
                ];
            }
            const { rows, count } = await this.ProjectFile.findAndCountAll({
                where,
                order: [
                    ["is_folder", "DESC"],
                    ["name", "ASC"],
                ],
                limit: safeLimit,
                offset,
            });
            return {
                rows,
                total: Number(count) || 0,
                page: safePage,
                limit: safeLimit,
            };
        } catch (err) {
            this.logError("listProjectFiles", err);
            throw err;
        }
    }

    async getProjectFileForDownload(projectId, fileId) {
        try {
            const file = await this.ProjectFile.findOne({
                where: {
                    id: Number(fileId),
                    project_id: Number(projectId),
                    deleted_at: null,
                },
            });
            if (!file) {
                const err = new Error("File not found");
                err.statusCode = 404;
                throw err;
            }
            const diskPath = this.resolveDiskPath(file.path);
            if (!diskPath) {
                const err = new Error("File path not found");
                err.statusCode = 404;
                throw err;
            }
            try {
                await fs.access(diskPath);
            } catch (accessErr) {
                const err = new Error("File not found on disk");
                err.statusCode = 404;
                throw err;
            }
            return { file, diskPath };
        } catch (err) {
            this.logError("getProjectFileForDownload", err);
            throw err;
        }
    }

    async createProjectFolder(projectId, payload = {}, uploadedBy = null) {
        try {
            const displayName = String(payload.name || "").trim();
            if (!displayName) {
                const err = new Error("Folder name is required");
                err.statusCode = 400;
                throw err;
            }
            await this.getById(projectId);

            const shareScope =
                payload.share_scope &&
                ["only_me", "all_members", "selected"].includes(
                    payload.share_scope,
                )
                    ? payload.share_scope
                    : "only_me";
            const sharedWith =
                shareScope === "selected" ? payload.shared_with || [] : [];

            const folderSlug = `${crypto.randomInt(10000000, 100000000)}`;
            let parent = null;
            const parentId =
                payload.parent_id && payload.parent_id !== "null"
                    ? Number(payload.parent_id)
                    : null;
            if (parentId) {
                parent = await this.ProjectFile.findOne({
                    where: {
                        id: parentId,
                        project_id: Number(projectId),
                    },
                });
                if (!parent || !parent.is_folder) {
                    const err = new Error("Parent folder not found");
                    err.statusCode = 404;
                    throw err;
                }
            }

            const basePath = `/upload/projects/${projectId}`;
            const parentRelative = parent
                ? parent.path.replace(`${basePath}/`, "")
                : "";
            const relativePath = parentRelative
                ? `${parentRelative}/${folderSlug}`
                : folderSlug;
            const diskDir = path.join(
                uploadRoot,
                "projects",
                String(projectId),
                ...(parentRelative ? parentRelative.split("/") : []),
                folderSlug,
            );
            await fs.mkdir(diskDir, { recursive: true });

            return this.ProjectFile.create({
                project_id: Number(projectId),
                parent_id: parent ? parent.id : null,
                uploaded_by: uploadedBy,
                name: displayName,
                path: `${basePath}/${relativePath}`,
                is_folder: true,
                share_scope: shareScope,
                shared_with: sharedWith,
            });
        } catch (err) {
            this.logError("createProjectFolder", err);
            throw err;
        }
    }

    async uploadProjectFile(
        projectId,
        filePart,
        fields = {},
        uploadedBy = null,
    ) {
        try {
            if (!filePart || !filePart.buffer) {
                const err = new Error("File is required");
                err.statusCode = 400;
                throw err;
            }
            await this.getById(projectId);

            const shareScope =
                fields.share_scope &&
                ["only_me", "all_members", "selected"].includes(
                    fields.share_scope,
                )
                    ? fields.share_scope
                    : "only_me";
            let sharedWith = [];
            if (shareScope === "selected" && fields.shared_with) {
                try {
                    const parsed = JSON.parse(fields.shared_with);
                    sharedWith = Array.isArray(parsed) ? parsed : [];
                } catch (err) {
                    const parseErr = new Error("Invalid shared members");
                    parseErr.statusCode = 400;
                    throw parseErr;
                }
            }

            const originalName = String(filePart.filename || "file").trim();
            const safeName = originalName.replace(/[\\\/]/g, "-");
            const ext = path.extname(safeName);
            const diskName = `${crypto.randomBytes(10).toString("hex")}${ext}`;

            let parent = null;
            const parentId =
                fields.parent_id && fields.parent_id !== "null"
                    ? fields.parent_id
                    : null;
            if (parentId) {
                parent = await this.ProjectFile.findOne({
                    where: {
                        id: Number(parentId),
                        project_id: Number(projectId),
                    },
                });
                if (!parent || !parent.is_folder) {
                    const err = new Error("Parent folder not found");
                    err.statusCode = 404;
                    throw err;
                }
            }

            const buffer = filePart.buffer;
            const basePath = `/upload/projects/${projectId}`;
            const parentRelative = parent
                ? parent.path.replace(`${basePath}/`, "")
                : "";
            const relativePath = parentRelative
                ? `${parentRelative}/${diskName}`
                : diskName;
            const diskDir = path.join(
                uploadRoot,
                "projects",
                String(projectId),
                ...(parentRelative ? parentRelative.split("/") : []),
            );
            await fs.mkdir(diskDir, { recursive: true });
            const diskPath = path.join(diskDir, diskName);
            await fs.writeFile(diskPath, buffer);

            return this.ProjectFile.create({
                project_id: Number(projectId),
                parent_id: parent ? parent.id : null,
                uploaded_by: uploadedBy,
                name: safeName,
                path: `${basePath}/${relativePath}`,
                is_folder: false,
                share_scope: shareScope,
                shared_with: sharedWith,
                mime_type: filePart.mimetype || null,
                size_bytes: buffer.length,
            });
        } catch (err) {
            this.logError("uploadProjectFile", err);
            throw err;
        }
    }
}

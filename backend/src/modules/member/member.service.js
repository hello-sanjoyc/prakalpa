import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { Sequelize, QueryTypes } from "sequelize";
import sharp from "sharp";
import initModels from "../../models/index.js";
import { env, logger } from "../../config/index.js";
import { getEmailQueue } from "../../queues/email.queue.js";
import {
    hashIdFields,
    resolveIdFromModel,
    resolveOptionalIdFromModel,
} from "../../lib/id-hash.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const emailTemplateDir = path.resolve(__dirname, "../../views/emails");
const uploadRoot = path.resolve(__dirname, "../../../upload");

export default class MemberService {
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
        this.Member = models.Member;
        this.User = models.User;
        this.UserRole = models.UserRole;
        this.Role = models.Role;
        this.Department = models.Department;
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

    async enqueueEmailJob(to, subject, template, context = {}) {
        const queue = getEmailQueue();
        if (!queue) return;
        const payload = {
            to,
            subject,
            template,
            context,
            from: env.SMTP_FROM || env.SMTP_USER,
            createdAt: new Date().toISOString(),
        };
        await queue.add("send-email", payload, {
            attempts: 3,
            backoff: { type: "exponential", delay: 3000 },
            removeOnComplete: true,
            removeOnFail: false,
        });
    }

    async list({
        page = 1,
        limit = 25,
        sortBy = "name",
        sortOrder = "asc",
        search = "",
        projectMember = null,
    } = {}) {
        const projectMemberId = projectMember
            ? await resolveIdFromModel(this.Member, projectMember, "project_member")
            : null;
        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200);
        const offset = (safePage - 1) * safeLimit;
        const orderDir =
            String(sortOrder).toLowerCase() === "desc" ? "DESC" : "ASC";
        const sortMap = {
            name: "m.full_name",
            designation: "m.designation",
            department: "d.name",
            role: "MIN(r.name)",
        };
        const orderBy = sortMap[sortBy] || sortMap.name;
        const trimmedSearch = String(search || "").trim();
        const likeSearch = trimmedSearch ? `%${trimmedSearch}%` : null;
        const extraWhere = [];
        if (projectMember) {
            extraWhere.push("pm_self.member_id IS NOT NULL");
            extraWhere.push("m.id <> :projectMemberId");
        }
        const projectMemberJoin = projectMember
            ? `LEFT JOIN project_members pm ON pm.member_id = m.id
            LEFT JOIN project_members pm_self ON pm_self.project_id = pm.project_id AND pm_self.member_id = :projectMemberId`
            : "";

        const whereClause = trimmedSearch
            ? `WHERE (
                m.full_name LIKE :search
                OR m.designation LIKE :search
                OR m.phone LIKE :search
                OR m.email LIKE :search
                OR d.name LIKE :search
                OR r.name LIKE :search
                OR r.slug LIKE :search
            )`
            : "";

        const combinedWhere = [whereClause.replace(/^WHERE\s*/i, "").trim()]
            .filter(Boolean)
            .concat(extraWhere)
            .map((s) => s.trim())
            .filter(Boolean);

        const finalWhereClause = combinedWhere.length
            ? `WHERE ${combinedWhere.join(" AND ")}`
            : "";

        const rowsSql = `
            SELECT
                m.*,
                u.id AS user_id,
                u.username AS user_username,
                u.email AS user_email,
                u.department_id AS user_department_id,
                GROUP_CONCAT(DISTINCT r.name) AS role_names,
                GROUP_CONCAT(DISTINCT r.slug) AS role_slugs,
                d.name AS department_name
            FROM members m
            LEFT JOIN users u ON u.member_id = m.id AND u.deleted_at IS NULL
            LEFT JOIN user_roles ur ON ur.user_id = u.id
            LEFT JOIN roles r ON r.id = ur.role_id 
            LEFT JOIN departments d ON d.id = m.department_id
            ${projectMemberJoin}
            ${finalWhereClause}
            GROUP BY m.id, u.id
            ORDER BY ${orderBy} ${orderDir}, m.full_name ASC
            LIMIT :limit OFFSET :offset
            `;

        const rows =
            (await this.sequelize.query(rowsSql, {
                type: QueryTypes.SELECT,
                replacements: {
                    limit: safeLimit,
                    offset,
                    ...(likeSearch ? { search: likeSearch } : {}),
                    ...(projectMember
                        ? { projectMemberId }
                        : {}),
                },
            })) || [];

        const countSql = `
            SELECT COUNT(DISTINCT m.id) AS total
            FROM members m
            LEFT JOIN departments d ON d.id = m.department_id
            LEFT JOIN users u ON u.member_id = m.id AND u.deleted_at IS NULL
            LEFT JOIN user_roles ur ON ur.user_id = u.id
            LEFT JOIN roles r ON r.id = ur.role_id
            ${projectMemberJoin}
            ${finalWhereClause}
            `;

        const [{ total = 0 } = {}] =
            (await this.sequelize.query(countSql, {
                type: QueryTypes.SELECT,
                replacements: {
                    ...(likeSearch ? { search: likeSearch } : {}),
                    ...(projectMember
                        ? { projectMemberId }
                        : {}),
                },
            })) || [];

        return {
            rows: hashIdFields(
                rows.map((row) => this.normalizeAvatarPath(row)),
            ),
            total: Number(total) || 0,
            page: safePage,
            limit: safeLimit,
        };
    }

    async getById(id) {
        const memberId = await resolveIdFromModel(this.Member, id, "id");

        const [member] =
            (await this.sequelize.query(
                `
            SELECT
                m.*,
                u.id AS user_id,
                u.username AS user_username,
                u.email AS user_email,
                u.department_id AS user_department_id,
                GROUP_CONCAT(DISTINCT r.name) AS role_names,
                GROUP_CONCAT(DISTINCT r.slug) AS role_slugs,
                d.name AS department_name
            FROM members m
            LEFT JOIN users u
                ON u.member_id = m.id
                AND u.deleted_at IS NULL
            LEFT JOIN user_roles ur
                ON ur.user_id = u.id
            LEFT JOIN roles r
                ON r.id = ur.role_id
            LEFT JOIN departments d
                ON d.id = m.department_id
            WHERE m.id = :id
            GROUP BY
                m.id,
                u.id,
                d.name
            LIMIT 1
            `,
                {
                    type: QueryTypes.SELECT,
                    replacements: { id: memberId },
                },
            )) || [];

        if (!member) {
            const err = new Error("Member not found");
            err.statusCode = 404;
            throw err;
        }

        // Projects
        const projects =
            (await this.sequelize.query(
                `
            SELECT
                p.id AS project_id,
                p.title AS project_name,
                pm.role AS project_role
            FROM project_members pm
            INNER JOIN projects p
                ON p.id = pm.project_id
            WHERE pm.member_id = :id
              AND p.deleted_at IS NULL
            ORDER BY p.title ASC
            `,
                {
                    type: QueryTypes.SELECT,
                    replacements: { id: memberId },
                },
            )) || [];

        // Task Summary (aligned with your actual schema: PENDING / IN_PROGRESS / COMPLETE)
        const [taskStats] =
            (await this.sequelize.query(
                `
            SELECT
                COUNT(*) AS total_tasks,

                SUM(CASE WHEN t.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count,
                SUM(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress_count,
                SUM(CASE WHEN t.status = 'COMPLETE' THEN 1 ELSE 0 END) AS complete_count,

                SUM(CASE WHEN t.priority = 'LOW' THEN 1 ELSE 0 END) AS low_priority_count,
                SUM(CASE WHEN t.priority = 'MEDIUM' THEN 1 ELSE 0 END) AS medium_priority_count,
                SUM(CASE WHEN t.priority = 'HIGH' THEN 1 ELSE 0 END) AS high_priority_count

            FROM tasks t
            WHERE t.owner_id = :id
              AND t.deleted_at IS NULL
            `,
                {
                    type: QueryTypes.SELECT,
                    replacements: { id: memberId },
                },
            )) || [];

        const normalizedMember = this.normalizeAvatarPath(member);

        normalizedMember.projects = projects.map((project) => ({
            id: project.project_id,
            title: project.project_name,
            role: project.project_role,
        }));

        // Attach Summary (no task list anymore)
        normalizedMember.task_summary = {
            total: Number(taskStats?.total_tasks || 0),

            status: {
                pending: Number(taskStats?.pending_count || 0),
                in_progress: Number(taskStats?.in_progress_count || 0),
                complete: Number(taskStats?.complete_count || 0),
            },

            priority: {
                low: Number(taskStats?.low_priority_count || 0),
                medium: Number(taskStats?.medium_priority_count || 0),
                high: Number(taskStats?.high_priority_count || 0),
            },
        };

        return hashIdFields(normalizedMember);
    }

    async create(payload, avatarFile = null) {
        const departmentId = await resolveOptionalIdFromModel(
            this.Department,
            payload?.department_id,
            "department_id",
        );
        const roleId = await resolveOptionalIdFromModel(
            this.Role,
            payload?.role_id,
            "role_id",
        );
        const t = await this.sequelize.transaction();
        try {
            const {
                full_name,
                email,
                phone,
                secondary_phone,
                whatsapp,
                designation,
                username,
            } = payload;

            const member = await this.Member.create(
                {
                    full_name,
                    email,
                    phone,
                    secondary_phone: secondary_phone || null,
                    whatsapp: whatsapp || null,
                    designation: designation || null,
                    department_id: departmentId || null,
                },
                { transaction: t },
            );

            const passwordSeed = "Password@123";
            const password_hash = await bcrypt.hash(String(passwordSeed), 10);

            const user = await this.User.create(
                {
                    member_id: member.id,
                    username,
                    email,
                    password_hash,
                    department_id: departmentId || null,
                    is_active: 1,
                },
                { transaction: t },
            );

            let roleName = "";
            if (roleId) {
                const role = await this.Role.findByPk(roleId);
                roleName = role?.name || role?.slug || "";
                await this.UserRole.destroy({
                    where: { user_id: user.id },
                    transaction: t,
                });
                await this.UserRole.create(
                    {
                        user_id: user.id,
                        role_id: roleId,
                        department_id: departmentId || 0,
                    },
                    { transaction: t },
                );
            }

            if (avatarFile) {
                await this.applyAvatar(member, avatarFile, t);
            }
            await t.commit();
            // enqueue email job (fire-and-forget)
            const memberPayload = member.toJSON();
            const userPayload = user.toJSON();
            this.enqueueEmailJob(
                memberPayload.email,
                `Welcome to ${env.APP_NAME}`,
                path.join(emailTemplateDir, "member-welcome.ejs"),
                {
                    member: memberPayload,
                    user: userPayload,
                    password: passwordSeed,
                    roleName,
                    appName: env.APP_NAME,
                    appUrl: env.APP_URL,
                },
            ).catch((err) => logger.error({ err }, "Failed to enqueue email"));
            this.normalizeAvatarPath(member);
            return hashIdFields(member);
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async update(id, payload, avatarFile = null) {
        const memberId = await resolveIdFromModel(this.Member, id, "id");
        const t = await this.sequelize.transaction();
        try {
            const member = await this.Member.findByPk(memberId, { transaction: t });
            if (!member) {
                const err = new Error("Member not found");
                err.statusCode = 404;
                throw err;
            }

            const user = await this.User.findOne({
                where: { member_id: memberId, deleted_at: null },
                transaction: t,
            });

            const hasDepartment =
                Object.prototype.hasOwnProperty.call(payload || {}, "department_id");
            const hasRole =
                Object.prototype.hasOwnProperty.call(payload || {}, "role_id");
            const departmentId = hasDepartment
                ? await resolveOptionalIdFromModel(
                      this.Department,
                      payload?.department_id,
                      "department_id",
                  )
                : undefined;
            const roleId = hasRole
                ? await resolveOptionalIdFromModel(this.Role, payload?.role_id, "role_id")
                : undefined;

            const {
                full_name,
                email,
                phone,
                secondary_phone,
                whatsapp,
                designation,
                username,
            } = payload;

            member.set({
                full_name: full_name ?? member.full_name,
                email: email ?? member.email,
                phone: phone ?? member.phone,
                secondary_phone:
                    secondary_phone !== undefined
                        ? secondary_phone || null
                        : member.secondary_phone,
                whatsapp:
                    whatsapp !== undefined ? whatsapp || null : member.whatsapp,
                designation:
                    designation !== undefined
                        ? designation || null
                        : member.designation,
                department_id:
                    hasDepartment
                        ? departmentId || null
                        : member.department_id,
            });
            await member.save({ transaction: t });

            if (user) {
                user.set({
                    username: username ?? user.username,
                    email: email ?? user.email,
                    department_id:
                        hasDepartment
                            ? departmentId || null
                            : user.department_id,
                });
                await user.save({ transaction: t });

                if (hasRole && roleId) {
                    await this.UserRole.destroy({
                        where: { user_id: user.id },
                        transaction: t,
                    });
                    await this.UserRole.create(
                        {
                            user_id: user.id,
                            role_id: roleId,
                            department_id: (hasDepartment ? departmentId : user.department_id) || 0,
                        },
                        { transaction: t },
                    );
                }
            }

            if (avatarFile) {
                await this.applyAvatar(member, avatarFile, t);
            }

            await t.commit();
            this.normalizeAvatarPath(member);
            return hashIdFields(member);
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async delete(id) {
        const memberId = await resolveIdFromModel(this.Member, id, "id");
        const t = await this.sequelize.transaction();
        try {
            const member = await this.Member.findByPk(memberId, { transaction: t });
            if (!member) {
                const err = new Error("Member not found");
                err.statusCode = 404;
                throw err;
            }

            const user = await this.User.findOne({
                where: { member_id: memberId },
                transaction: t,
            });

            if (user) {
                await this.UserRole.destroy({
                    where: { user_id: user.id },
                    transaction: t,
                });
                user.deleted_at = new Date();
                await user.save({ transaction: t });
            }

            await member.destroy({ transaction: t });
            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async applyAvatar(member, file, transaction = null) {
        if (!file || !file.buffer) {
            const err = new Error("Avatar file is required");
            err.statusCode = 400;
            throw err;
        }

        const allowedTypes = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
        };
        const ext = allowedTypes[file.mimetype];
        if (!ext) {
            const err = new Error("Only JPG and PNG images are allowed");
            err.statusCode = 400;
            throw err;
        }

        if (file.buffer.length > 50 * 1024) {
            const err = new Error("Avatar must be 50KB or smaller");
            err.statusCode = 400;
            throw err;
        }

        const metadata = await sharp(file.buffer).metadata();
        const withinRange =
            metadata.width >= 250 &&
            metadata.height >= 250 &&
            metadata.width <= 512 &&
            metadata.height <= 512;
        if (!withinRange) {
            const err = new Error(
                "Avatar must be between 250x250 and 512x512 pixels",
            );
            err.statusCode = 400;
            throw err;
        }

        const fileName = `${crypto.randomBytes(16).toString("hex")}${ext}`;
        const uploadDir = path.join(uploadRoot, "members", String(member.id));
        await fs.mkdir(uploadDir, { recursive: true });
        const diskPath = path.join(uploadDir, fileName);
        await fs.writeFile(diskPath, file.buffer);

        const avatarPath = `/upload/members/${member.id}/${fileName}`;
        member.avatar_path = avatarPath;
        await member.save(transaction ? { transaction } : undefined);
    }
}

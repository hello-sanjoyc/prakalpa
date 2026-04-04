import { QueryTypes, Sequelize } from "sequelize";
import initModels from "../../models/index.js";
import { env } from "../../config/index.js";
import { hashIdFields, resolveOptionalIdFromModel } from "../../lib/id-hash.js";

function periodStartDate(period) {
    const now = new Date();
    const start = new Date(now);
    if (period === "7d") {
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        return start;
    }
    if (period === "qtr") {
        const month = now.getMonth();
        const quarterStartMonth = Math.floor(month / 3) * 3;
        return new Date(now.getFullYear(), quarterStartMonth, 1, 0, 0, 0, 0);
    }
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    return start;
}

export default class DashboardService {
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
    }

    async getOverview({ period = "30d", department_id = null, authUserId = null } = {}) {
        const safePeriod = ["7d", "30d", "qtr"].includes(String(period))
            ? String(period)
            : "30d";

        const userId = Number(authUserId) || 0;
        if (!userId) {
            const err = new Error("Unauthorized");
            err.statusCode = 401;
            throw err;
        }

        const [authUser] =
            (await this.sequelize.query(
                `
                SELECT id, member_id
                FROM users
                WHERE id = :userId
                  AND deleted_at IS NULL
                LIMIT 1
                `,
                {
                    type: QueryTypes.SELECT,
                    replacements: { userId },
                },
            )) || [];

        const authMemberId = Number(authUser?.member_id) || 0;
        if (!authMemberId) {
            return {
                period: safePeriod,
                scope: { department_id: null },
                kpis: {
                    projects: 0,
                    open_tasks: 0,
                    overdue_tasks: 0,
                    files_uploaded: 0,
                    budget_total: 0,
                    budget_consumed: 0,
                    budget_burn: 0,
                },
                project_health: [],
                upcoming_deadlines: [],
                activities: [],
                team_workload: [],
                finance_overview: [],
                files_logs: {
                    files_uploaded: 0,
                    action_logs: 0,
                    completion_signals: 0,
                    pending_reviews: 0,
                },
            };
        }

        const resolvedDepartmentId = await resolveOptionalIdFromModel(
            this.Department,
            department_id,
            "department_id",
        );

        const baseWhereParts = [
            "p.deleted_at IS NULL",
            "(u.member_id = :authMemberId OR EXISTS (SELECT 1 FROM project_members pm_scope WHERE pm_scope.project_id = p.id AND pm_scope.member_id = :authMemberId))",
        ];

        if (resolvedDepartmentId) {
            baseWhereParts.push("p.department_id = :departmentId");
        }

        const baseWhere = baseWhereParts.join(" AND ");
        const projectScopeSql = `
            SELECT p.id
            FROM projects p
            LEFT JOIN users u ON u.id = p.owner_id
            WHERE ${baseWhere}
        `;

        const periodStart = periodStartDate(safePeriod);
        const replacements = {
            authMemberId,
            periodStart,
            ...(resolvedDepartmentId ? { departmentId: resolvedDepartmentId } : {}),
        };

        const [kpiRow = {}] =
            (await this.sequelize.query(
                `
                SELECT
                    (SELECT COUNT(*) FROM (${projectScopeSql}) scoped_projects) AS projects,
                    (
                        SELECT COUNT(*)
                        FROM tasks t
                        JOIN milestones m ON m.id = t.milestone_id
                        WHERE m.project_id IN (${projectScopeSql})
                          AND m.deleted_at IS NULL
                          AND t.deleted_at IS NULL
                          AND t.status = 'OPEN'
                    ) AS open_tasks,
                    (
                        SELECT COUNT(*)
                        FROM tasks t
                        JOIN milestones m ON m.id = t.milestone_id
                        WHERE m.project_id IN (${projectScopeSql})
                          AND m.deleted_at IS NULL
                          AND t.deleted_at IS NULL
                          AND t.status <> 'DONE'
                          AND t.due_date IS NOT NULL
                          AND t.due_date < NOW()
                    ) AS overdue_tasks,
                    (
                        SELECT COUNT(*)
                        FROM project_files pf
                        WHERE pf.project_id IN (${projectScopeSql})
                          AND pf.deleted_at IS NULL
                          AND pf.is_folder = 0
                          AND pf.created_at >= :periodStart
                    ) AS files_uploaded,
                    (
                        SELECT COALESCE(SUM(p2.budget), 0)
                        FROM projects p2
                        WHERE p2.id IN (${projectScopeSql})
                    ) AS budget_total,
                    (
                        SELECT COALESCE(SUM(p2.fund_consumed), 0)
                        FROM projects p2
                        WHERE p2.id IN (${projectScopeSql})
                    ) AS budget_consumed
                `,
                {
                    type: QueryTypes.SELECT,
                    replacements,
                },
            )) || [];

        const budgetTotal = Number(kpiRow.budget_total || 0);
        const budgetConsumed = Number(kpiRow.budget_consumed || 0);
        const budgetBurn = budgetTotal
            ? Math.round((budgetConsumed / budgetTotal) * 100)
            : 0;

        const projectHealth =
            (await this.sequelize.query(
                `
                SELECT
                    p.id,
                    p.title,
                    d.id AS department_id,
                    d.name AS department_name,
                    m.id AS owner_id,
                    m.full_name AS owner_name,
                    p.rag_status,
                    p.budget,
                    p.fund_allocated,
                    p.fund_consumed,
                    COALESCE(ms.done_count, 0) AS milestones_done,
                    COALESCE(ms.total_count, 0) AS milestones_total,
                    COALESCE(ts.open_tasks, 0) AS open_tasks,
                    COALESCE(ts.blocked_tasks, 0) AS blocked_tasks,
                    DATEDIFF(COALESCE(p.revised_end_date, p.end_date, CURDATE()), CURDATE()) AS due_in_days
                FROM projects p
                LEFT JOIN users u ON u.id = p.owner_id
                LEFT JOIN members m ON m.id = u.member_id
                LEFT JOIN departments d ON d.id = p.department_id
                LEFT JOIN (
                    SELECT
                        project_id,
                        SUM(CASE WHEN status = 'COMPLETE' THEN 1 ELSE 0 END) AS done_count,
                        COUNT(*) AS total_count
                    FROM milestones
                    WHERE deleted_at IS NULL
                    GROUP BY project_id
                ) ms ON ms.project_id = p.id
                LEFT JOIN (
                    SELECT
                        m.project_id,
                        SUM(CASE WHEN t.status = 'OPEN' THEN 1 ELSE 0 END) AS open_tasks,
                        SUM(CASE WHEN t.status = 'BLOCKED' THEN 1 ELSE 0 END) AS blocked_tasks
                    FROM tasks t
                    JOIN milestones m ON m.id = t.milestone_id
                    WHERE t.deleted_at IS NULL
                      AND m.deleted_at IS NULL
                    GROUP BY m.project_id
                ) ts ON ts.project_id = p.id
                WHERE ${baseWhere}
                ORDER BY due_in_days ASC, p.title ASC
                LIMIT 20
                `,
                {
                    type: QueryTypes.SELECT,
                    replacements,
                },
            )) || [];

        const teamWorkload =
            (await this.sequelize.query(
                `
                SELECT
                    mem.id,
                    mem.full_name,
                    mem.avatar_path,
                    d.id AS department_id,
                    d.name AS department_name,
                    COALESCE(GROUP_CONCAT(DISTINCT r.name), 'Member') AS role_name,
                    COUNT(DISTINCT CASE WHEN t.status IN ('OPEN', 'IN_PROGRESS', 'BLOCKED') THEN t.id END) AS active_tasks,
                    COUNT(DISTINCT CASE WHEN t.status = 'IN_PROGRESS' THEN t.id END) AS in_progress
                FROM project_members pm
                JOIN (${projectScopeSql}) scoped_projects ON scoped_projects.id = pm.project_id
                JOIN members mem ON mem.id = pm.member_id
                LEFT JOIN departments d ON d.id = mem.department_id
                LEFT JOIN milestones ms ON ms.project_id = pm.project_id AND ms.deleted_at IS NULL
                LEFT JOIN tasks t ON t.milestone_id = ms.id AND t.owner_id = mem.id AND t.deleted_at IS NULL
                LEFT JOIN users u_member ON u_member.member_id = mem.id AND u_member.deleted_at IS NULL
                LEFT JOIN user_roles ur ON ur.user_id = u_member.id
                LEFT JOIN roles r ON r.id = ur.role_id
                GROUP BY mem.id, mem.full_name, mem.avatar_path, d.id, d.name
                ORDER BY active_tasks DESC, mem.full_name ASC
                LIMIT 10
                `,
                {
                    type: QueryTypes.SELECT,
                    replacements,
                },
            )) || [];

        const financeOverview =
            (await this.sequelize.query(
                `
                SELECT
                    p.id,
                    p.title,
                    p.fund_allocated,
                    p.fund_consumed
                FROM projects p
                JOIN (${projectScopeSql}) scoped_projects ON scoped_projects.id = p.id
                ORDER BY p.fund_consumed DESC, p.title ASC
                LIMIT 10
                `,
                {
                    type: QueryTypes.SELECT,
                    replacements,
                },
            )) || [];

        const [filesLogsRow = {}] =
            (await this.sequelize.query(
                `
                SELECT
                    (
                        SELECT COUNT(*)
                        FROM project_files pf
                        WHERE pf.project_id IN (${projectScopeSql})
                          AND pf.deleted_at IS NULL
                          AND pf.is_folder = 0
                          AND pf.created_at >= :periodStart
                    ) AS files_uploaded,
                    (
                        SELECT COUNT(*)
                        FROM actions a
                        JOIN tasks t ON t.id = a.task_id
                        JOIN milestones m ON m.id = t.milestone_id
                        WHERE m.project_id IN (${projectScopeSql})
                          AND m.deleted_at IS NULL
                          AND t.deleted_at IS NULL
                          AND a.created_at >= :periodStart
                    ) AS action_logs,
                    (
                        SELECT COUNT(*)
                        FROM tasks t
                        JOIN milestones m ON m.id = t.milestone_id
                        WHERE m.project_id IN (${projectScopeSql})
                          AND m.deleted_at IS NULL
                          AND t.deleted_at IS NULL
                          AND t.status = 'DONE'
                          AND t.updated_at >= :periodStart
                    ) AS completion_signals,
                    (
                        SELECT COUNT(*)
                        FROM approvals ap
                        WHERE ap.project_id IN (${projectScopeSql})
                          AND ap.status = 'PENDING'
                    ) AS pending_reviews
                `,
                {
                    type: QueryTypes.SELECT,
                    replacements,
                },
            )) || [];

        const activities =
            (await this.sequelize.query(
                `
                SELECT *
                FROM (
                    SELECT
                        a.id,
                        'action' AS type,
                        a.title AS text,
                        a.created_at,
                        p.id AS project_id,
                        p.title AS project_title
                    FROM actions a
                    JOIN tasks t ON t.id = a.task_id
                    JOIN milestones m ON m.id = t.milestone_id
                    JOIN projects p ON p.id = m.project_id
                    WHERE p.id IN (${projectScopeSql})
                      AND m.deleted_at IS NULL
                      AND t.deleted_at IS NULL
                      AND a.created_at >= :periodStart

                    UNION ALL

                    SELECT
                        pf.id,
                        'file' AS type,
                        CONCAT('File uploaded: ', pf.name) AS text,
                        pf.created_at,
                        p.id AS project_id,
                        p.title AS project_title
                    FROM project_files pf
                    JOIN projects p ON p.id = pf.project_id
                    WHERE p.id IN (${projectScopeSql})
                      AND pf.deleted_at IS NULL
                      AND pf.is_folder = 0
                      AND pf.created_at >= :periodStart

                    UNION ALL

                    SELECT
                        pf2.id,
                        'finance' AS type,
                        CONCAT('Finance entry added on ', DATE_FORMAT(pf2.entry_date, '%Y-%m-%d')) AS text,
                        pf2.created_at,
                        p.id AS project_id,
                        p.title AS project_title
                    FROM project_finances pf2
                    JOIN projects p ON p.id = pf2.project_id
                    WHERE p.id IN (${projectScopeSql})
                      AND pf2.deleted_at IS NULL
                      AND pf2.created_at >= :periodStart
                ) activity_union
                ORDER BY created_at DESC
                LIMIT 12
                `,
                {
                    type: QueryTypes.SELECT,
                    replacements,
                },
            )) || [];

        const response = {
            period: safePeriod,
            scope: {
                department_id: resolvedDepartmentId || null,
            },
            kpis: {
                projects: Number(kpiRow.projects || 0),
                open_tasks: Number(kpiRow.open_tasks || 0),
                overdue_tasks: Number(kpiRow.overdue_tasks || 0),
                files_uploaded: Number(kpiRow.files_uploaded || 0),
                budget_total: budgetTotal,
                budget_consumed: budgetConsumed,
                budget_burn: budgetBurn,
            },
            project_health: projectHealth,
            upcoming_deadlines: projectHealth.slice(0, 4),
            activities,
            team_workload: teamWorkload,
            finance_overview: financeOverview,
            files_logs: {
                files_uploaded: Number(filesLogsRow.files_uploaded || 0),
                action_logs: Number(filesLogsRow.action_logs || 0),
                completion_signals: Number(filesLogsRow.completion_signals || 0),
                pending_reviews: Number(filesLogsRow.pending_reviews || 0),
            },
        };

        return hashIdFields(response);
    }
}

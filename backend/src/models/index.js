import defineAction from "./action.model.js";
import defineApproval from "./approval.model.js";
import defineAuditLog from "./audit-log.model.js";
import defineDepartment from "./department.model.js";
import defineMember from "./member.model.js";
import defineMilestone from "./milestone.model.js";
import defineNotification from "./notification.model.js";
import definePermission from "./permission.model.js";
import defineProjectMember from "./project-member.model.js";
import defineProjectMemberRole from "./project-member-role.model.js";
import defineProject from "./project.model.js";
import defineProjectFile from "./project-file.model.js";
import defineProjectFinance from "./project-finance.model.js";
import defineProjectStage from "./project-stage.model.js";
import defineRagHistory from "./rag-history.model.js";
import defineRole from "./role.model.js";
import defineRolePermission from "./role-permission.model.js";
import defineTask from "./task.model.js";
import defineUser from "./user.model.js";
import defineUserRole from "./user-role.model.js";
import defineVendor from "./vendor.model.js";

export function initModels(sequelize) {
    const Action = defineAction(sequelize);
    const Approval = defineApproval(sequelize);
    const AuditLog = defineAuditLog(sequelize);
    const Department = defineDepartment(sequelize);
    const Member = defineMember(sequelize);
    const Milestone = defineMilestone(sequelize);
    const Notification = defineNotification(sequelize);
    const Permission = definePermission(sequelize);
    const ProjectMember = defineProjectMember(sequelize);
    const ProjectMemberRole = defineProjectMemberRole(sequelize);
    const Project = defineProject(sequelize);
    const ProjectFile = defineProjectFile(sequelize);
    const ProjectFinance = defineProjectFinance(sequelize);
    const ProjectStage = defineProjectStage(sequelize);
    const RagHistory = defineRagHistory(sequelize);
    const Role = defineRole(sequelize);
    const RolePermission = defineRolePermission(sequelize);
    const Task = defineTask(sequelize);
    const User = defineUser(sequelize);
    const UserRole = defineUserRole(sequelize);
    const Vendor = defineVendor(sequelize);

    // ===== Action =====
    Action.belongsTo(Task, { foreignKey: "task_id" });
    Action.belongsTo(User, { as: "owner", foreignKey: "owner_id" });

    // ===== Approval =====
    Approval.belongsTo(Project, { foreignKey: "project_id" });
    Approval.belongsTo(ProjectStage, { as: "stage", foreignKey: "stage_id" });
    Approval.belongsTo(User, { as: "approver", foreignKey: "approver_id" });

    // ===== AuditLog =====
    AuditLog.belongsTo(User, { as: "actor", foreignKey: "actor_id" });

    // ===== Department =====
    Department.belongsTo(Department, { as: "parent", foreignKey: "parent_id" });
    Department.hasMany(Department, { as: "children", foreignKey: "parent_id" });

    Department.hasMany(Member, { foreignKey: "department_id" });
    Department.hasMany(Project, { foreignKey: "department_id" });
    Department.hasMany(User, { foreignKey: "department_id" });
    Department.hasMany(UserRole, { foreignKey: "department_id" });


    // ===== Member =====
    Member.belongsTo(Department, { foreignKey: "department_id" });
    Member.hasOne(User, { foreignKey: "member_id" });

    // ===== Milestone =====
    Milestone.belongsTo(Project, { foreignKey: "project_id" });
    Milestone.hasMany(Task, { foreignKey: "milestone_id" });
    Milestone.hasMany(RagHistory, { foreignKey: "milestone_id" });

    // ===== Notification =====
    Notification.belongsTo(User, { foreignKey: "user_id" });

    // ===== Permission =====
    Permission.belongsToMany(Role, {
        through: RolePermission,
        foreignKey: "permission_id",
        otherKey: "role_id",
    });

    // ===== Project =====
    Project.belongsTo(Department, {
        as: "department",
        foreignKey: "department_id",
    });
    Project.belongsTo(User, { as: "owner", foreignKey: "owner_id" });
    Project.belongsTo(ProjectStage, {
        as: "currentStage",
        foreignKey: "current_stage_id",
    });

    Project.hasMany(Approval, { foreignKey: "project_id" });
    Project.hasMany(ProjectFile, { foreignKey: "project_id" });
    Project.hasMany(ProjectFinance, { foreignKey: "project_id" });
    Project.hasMany(Milestone, { foreignKey: "project_id" });
    Project.hasMany(ProjectMember, { as: "projectMembers", foreignKey: "project_id" });
    Project.hasMany(RagHistory, { foreignKey: "project_id" });

    // ===== ProjectStage =====
    // ===== ProjectFile =====
    ProjectFile.belongsTo(Project, { foreignKey: "project_id" });
    ProjectFile.belongsTo(User, { as: "uploadedBy", foreignKey: "uploaded_by" });
    ProjectFile.belongsTo(ProjectFile, { as: "parent", foreignKey: "parent_id" });
    ProjectFile.hasMany(ProjectFile, { as: "children", foreignKey: "parent_id" });

    // ===== ProjectFinance =====
    ProjectFinance.belongsTo(Project, { foreignKey: "project_id" });

    // ===== ProjectMember =====
    ProjectMember.belongsTo(Project, {
        as: "project",
        foreignKey: "project_id",
    });
    ProjectMember.belongsTo(Member, {
        as: "member",
        foreignKey: "member_id",
    });
    Member.hasMany(ProjectMember, { as: "projectMemberships", foreignKey: "member_id" });

    ProjectStage.hasMany(Approval, { as: "approvals", foreignKey: "stage_id" });

    // ===== RagHistory =====
    RagHistory.belongsTo(Project, { foreignKey: "project_id" });
    RagHistory.belongsTo(Milestone, { foreignKey: "milestone_id" });
    RagHistory.belongsTo(Task, { foreignKey: "task_id" });
    RagHistory.belongsTo(User, { as: "creator", foreignKey: "created_by" });

    // ===== Role =====
    Role.belongsToMany(Permission, {
        through: RolePermission,
        foreignKey: "role_id",
        otherKey: "permission_id",
    });
    Role.hasMany(UserRole, { foreignKey: "role_id" });

    // ===== RolePermission =====
    RolePermission.belongsTo(Role, { foreignKey: "role_id" });
    RolePermission.belongsTo(Permission, { foreignKey: "permission_id" });

    // ===== Task =====
    Task.belongsTo(Milestone, { foreignKey: "milestone_id" });
    Task.belongsTo(User, { as: "owner", foreignKey: "owner_id" });

    Task.hasMany(Action, { foreignKey: "task_id" });
    Task.hasMany(RagHistory, { foreignKey: "task_id" });

    // ===== User =====
    User.belongsTo(Department, { foreignKey: "department_id" });
    User.belongsTo(Member, { as: "member", foreignKey: "member_id" });
    User.belongsTo(Vendor, { foreignKey: "vendor_id" });

    User.hasMany(Action, { as: "actions", foreignKey: "owner_id" });
    User.hasMany(Approval, { as: "approvals", foreignKey: "approver_id" });
    User.hasMany(AuditLog, { as: "auditLogs", foreignKey: "actor_id" });
    User.hasMany(ProjectFile, { as: "projectFiles", foreignKey: "uploaded_by" });
    User.hasMany(Notification, { foreignKey: "user_id" });
    User.hasMany(Project, { as: "ownedProjects", foreignKey: "owner_id" });
    User.hasMany(RagHistory, { as: "ragEntries", foreignKey: "created_by" });
    User.hasMany(Task, { as: "tasks", foreignKey: "owner_id" });
    User.hasMany(UserRole, { foreignKey: "user_id" });

    // ===== UserRole =====
    UserRole.belongsTo(User, { foreignKey: "user_id" });
    UserRole.belongsTo(Role, { foreignKey: "role_id" });
    UserRole.belongsTo(Department, { foreignKey: "department_id" });

    // ===== Vendor =====
    Vendor.hasMany(User, { foreignKey: "vendor_id" });

    return {
        Action,
        Approval,
        AuditLog,
        Department,
        Member,
        Milestone,
        Notification,
        Permission,
        Project,
        ProjectFile,
        ProjectFinance,
        ProjectMember,
        ProjectMemberRole,
        ProjectStage,
        RagHistory,
        Role,
        RolePermission,
        Task,
        User,
        UserRole,
        Vendor,
    };
}

export default initModels;

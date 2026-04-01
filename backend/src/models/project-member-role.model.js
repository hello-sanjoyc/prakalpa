import { DataTypes } from "sequelize";

export default function defineProjectMemberRole(sequelize) {
    return sequelize.define(
        "ProjectMemberRole",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            project_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                unique: "project_member_roles_project_id_name_unique",
            },
            name: {
                type: DataTypes.STRING(64),
                allowNull: false,
                unique: "project_member_roles_project_id_name_unique",
            },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "project_member_roles", timestamps: false }
    );
}

import { DataTypes } from "sequelize";

export default function defineProjectMember(sequelize) {
    return sequelize.define(
        "ProjectMember",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            project_id: { type: DataTypes.BIGINT, allowNull: false },
            member_id: { type: DataTypes.BIGINT, allowNull: false },
            role: {
                type: DataTypes.STRING(64),
                defaultValue: "MEMBER",
            },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "project_members", timestamps: false }
    );
}

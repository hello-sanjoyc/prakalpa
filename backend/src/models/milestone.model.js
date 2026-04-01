import { DataTypes } from "sequelize";

export default function defineMilestone(sequelize) {
    return sequelize.define(
        "Milestone",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            project_id: { type: DataTypes.BIGINT, allowNull: false },
            title: { type: DataTypes.STRING(512), allowNull: false },
            due_date: { type: DataTypes.DATEONLY, allowNull: true },
            status: {
                type: DataTypes.ENUM("PENDING", "IN_PROGRESS", "COMPLETE"),
                defaultValue: "PENDING",
            },
            deleted_at: { type: DataTypes.DATE, allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "milestones", timestamps: false }
    );
}

import { DataTypes } from "sequelize";

export default function defineTask(sequelize) {
    return sequelize.define(
        "Task",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            milestone_id: { type: DataTypes.BIGINT, allowNull: false },
            title: { type: DataTypes.STRING(512), allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: true },
            owner_id: { type: DataTypes.BIGINT, allowNull: true },
            sla_hours: { type: DataTypes.INTEGER, allowNull: true },
            due_date: { type: DataTypes.DATE, allowNull: true },
            priority: {
                type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
                defaultValue: "MEDIUM",
            },
            status: {
                type: DataTypes.ENUM("OPEN", "IN_PROGRESS", "BLOCKED", "DONE"),
                defaultValue: "OPEN",
            },
            dependencies: { type: DataTypes.JSON, allowNull: true },
            deleted_at: { type: DataTypes.DATE, allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            version: { type: DataTypes.INTEGER, defaultValue: 1 },
        },
        { tableName: "tasks", timestamps: false }
    );
}

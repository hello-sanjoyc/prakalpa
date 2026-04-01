import { DataTypes } from "sequelize";

export default function defineRagHistory(sequelize) {
    return sequelize.define(
        "RagHistory",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            project_id: { type: DataTypes.BIGINT, allowNull: true },
            milestone_id: { type: DataTypes.BIGINT, allowNull: true },
            task_id: { type: DataTypes.BIGINT, allowNull: true },
            previous_status: {
                type: DataTypes.ENUM("RED", "AMBER", "GREEN"),
                allowNull: true,
            },
            new_status: {
                type: DataTypes.ENUM("RED", "AMBER", "GREEN"),
                allowNull: false,
            },
            reason: { type: DataTypes.TEXT, allowNull: true },
            created_by: { type: DataTypes.BIGINT, allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "rag_history", timestamps: false }
    );
}

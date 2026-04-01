import { DataTypes } from "sequelize";

export default function defineAction(sequelize) {
    return sequelize.define(
        "Action",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            task_id: { type: DataTypes.BIGINT, allowNull: false },
            title: { type: DataTypes.STRING(512), allowNull: false },
            owner_id: { type: DataTypes.BIGINT, allowNull: true },
            due_date: { type: DataTypes.DATE, allowNull: true },
            status: { type: DataTypes.ENUM("OPEN", "DONE"), defaultValue: "OPEN" },
            evidence: { type: DataTypes.JSON, allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "actions", timestamps: false }
    );
}

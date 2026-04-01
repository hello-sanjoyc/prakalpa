import { DataTypes } from "sequelize";

export default function defineNotification(sequelize) {
    return sequelize.define(
        "Notification",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            user_id: { type: DataTypes.BIGINT, allowNull: true },
            payload: { type: DataTypes.JSON, allowNull: false },
            type: { type: DataTypes.STRING(128), allowNull: false },
            status: {
                type: DataTypes.ENUM("PENDING", "SENT", "FAILED"),
                defaultValue: "PENDING",
            },
            attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "notifications", timestamps: false }
    );
}

import { DataTypes } from "sequelize";

export default function defineAuditLog(sequelize) {
    return sequelize.define(
        "AuditLog",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            actor_id: { type: DataTypes.BIGINT, allowNull: true },
            actor_role: { type: DataTypes.STRING(255), allowNull: true },
            ip_address: { type: DataTypes.STRING(64), allowNull: true },
            entity_type: { type: DataTypes.STRING(128), allowNull: false },
            entity_id: { type: DataTypes.STRING(128), allowNull: false },
            action: { type: DataTypes.STRING(128), allowNull: false },
            before_state: { type: DataTypes.TEXT("long"), allowNull: true },
            after_state: { type: DataTypes.TEXT("long"), allowNull: true },
            tx_id: { type: DataTypes.STRING(128), allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "audit_logs", timestamps: false }
    );
}

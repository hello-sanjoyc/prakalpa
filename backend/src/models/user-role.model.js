import { DataTypes } from "sequelize";

export default function defineUserRole(sequelize) {
    return sequelize.define(
        "UserRole",
        {
            user_id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true },
            role_id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true },
            department_id: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0, primaryKey: true },
            version: { type: DataTypes.INTEGER, defaultValue: 1 },
            assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "user_roles", timestamps: false }
    );
}

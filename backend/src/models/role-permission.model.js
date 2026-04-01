import { DataTypes } from "sequelize";

export default function defineRolePermission(sequelize) {
    return sequelize.define(
        "RolePermission",
        {
            role_id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true },
            permission_id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true },
        },
        { tableName: "role_permissions", timestamps: false }
    );
}

import { DataTypes } from "sequelize";

export default function defineUser(sequelize) {
    return sequelize.define(
        "User",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            member_id: { type: DataTypes.BIGINT, allowNull: false },
            username: { type: DataTypes.STRING(150), allowNull: false, unique: true },
            email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
            password_hash: { type: DataTypes.STRING(255), allowNull: false },
            department_id: { type: DataTypes.BIGINT, allowNull: true },
            vendor_id: { type: DataTypes.BIGINT, allowNull: true },
            is_active: { type: DataTypes.TINYINT, defaultValue: 1 },
            version: { type: DataTypes.INTEGER, defaultValue: 1 },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            deleted_at: { type: DataTypes.DATE, allowNull: true },
        },
        { tableName: "users", timestamps: false }
    );
}

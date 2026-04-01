import { DataTypes } from "sequelize";

export default function defineDepartment(sequelize) {
    return sequelize.define(
        "Department",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING(255), allowNull: false },
            code: { type: DataTypes.STRING(64), allowNull: false, unique: true },
            parent_id: { type: DataTypes.BIGINT, allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            deleted_at: { type: DataTypes.DATE, allowNull: true },
        },
        { tableName: "departments", timestamps: false }
    );
}

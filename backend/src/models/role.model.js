import { DataTypes } from "sequelize";

export default function defineRole(sequelize) {
    return sequelize.define(
        "Role",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING(128), allowNull: false },
            slug: { type: DataTypes.STRING(128), allowNull: false, unique: true },
            description: { type: DataTypes.TEXT, allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "roles", timestamps: false }
    );
}

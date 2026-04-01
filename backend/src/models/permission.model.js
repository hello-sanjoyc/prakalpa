import { DataTypes } from "sequelize";

export default function definePermission(sequelize) {
    return sequelize.define(
        "Permission",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING(255), allowNull: false },
            slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
            description: { type: DataTypes.TEXT, allowNull: true },
        },
        { tableName: "permissions", timestamps: false }
    );
}

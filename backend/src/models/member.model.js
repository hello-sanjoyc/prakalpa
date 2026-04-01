import { DataTypes } from "sequelize";

export default function defineMember(sequelize) {
    return sequelize.define(
        "Member",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            full_name: { type: DataTypes.STRING(255), allowNull: true },
            email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
            phone: { type: DataTypes.STRING(15), allowNull: false, unique: true },
            secondary_phone: { type: DataTypes.STRING(15), allowNull: true },
            whatsapp: { type: DataTypes.STRING(15), allowNull: true, unique: true },
            designation: { type: DataTypes.STRING(255), allowNull: true },
            department_id: { type: DataTypes.BIGINT, allowNull: true },
            avatar_path: { type: DataTypes.STRING(1024), allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "members", timestamps: false }
    );
}

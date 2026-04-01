import { DataTypes } from "sequelize";

export default function defineVendor(sequelize) {
    return sequelize.define(
        "Vendor",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING(255), allowNull: false },
            registration_no: { type: DataTypes.STRING(128), allowNull: true },
            contact_email: { type: DataTypes.STRING(255), allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            deleted_at: { type: DataTypes.DATE, allowNull: true },
        },
        { tableName: "vendors", timestamps: false }
    );
}

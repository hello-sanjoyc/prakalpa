import { DataTypes } from "sequelize";

export default function defineContactInquiry(sequelize) {
    return sequelize.define(
        "ContactInquiry",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING(255), allowNull: false },
            organization_name: { type: DataTypes.STRING(255), allowNull: false },
            phone_number: { type: DataTypes.STRING(20), allowNull: false },
            email_address: { type: DataTypes.STRING(255), allowNull: false },
            message: { type: DataTypes.TEXT, allowNull: false },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "contact_inquiries", timestamps: false }
    );
}

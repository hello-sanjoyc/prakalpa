import { DataTypes } from "sequelize";

export default function defineProjectFinance(sequelize) {
    return sequelize.define(
        "ProjectFinance",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            project_id: { type: DataTypes.BIGINT, allowNull: false },
            entry_date: { type: DataTypes.DATEONLY, allowNull: false },
            fund_allocated: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
            fund_consumed: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
            note: { type: DataTypes.TEXT, allowNull: true },
            deleted_at: { type: DataTypes.DATE, allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "project_finances", timestamps: false },
    );
}

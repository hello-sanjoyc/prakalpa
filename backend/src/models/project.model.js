import { DataTypes } from "sequelize";

export default function defineProject(sequelize) {
    return sequelize.define(
        "Project",
        {
            id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            code: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
            },
            title: { type: DataTypes.STRING(100), allowNull: false },
            description: { type: DataTypes.STRING(512), allowNull: false },
            department_id: { type: DataTypes.BIGINT, allowNull: false },
            owner_id: { type: DataTypes.BIGINT, allowNull: false },
            fin_year: { type: DataTypes.STRING(9), allowNull: true },
            budget: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
            fund_allocated: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
            fund_consumed: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
            current_stage_id: { type: DataTypes.INTEGER, allowNull: false },
            rag_status: {
                type: DataTypes.ENUM("RED", "AMBER", "GREEN"),
                defaultValue: "GREEN",
            },
            rag_manual_override: { type: DataTypes.TINYINT, defaultValue: 0 },
            rag_override_reason: { type: DataTypes.TEXT, allowNull: true },
            start_date: { type: DataTypes.DATEONLY, allowNull: true },
            end_date: { type: DataTypes.DATEONLY, allowNull: true },
            revised_start_date: { type: DataTypes.DATEONLY, allowNull: true },
            revised_end_date: { type: DataTypes.DATEONLY, allowNull: true },
            actual_start_date: { type: DataTypes.DATEONLY, allowNull: true },
            actual_end_date: { type: DataTypes.DATEONLY, allowNull: true },
            version: { type: DataTypes.INTEGER, defaultValue: 1 },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            deleted_at: { type: DataTypes.DATE, allowNull: true },
        },
        { tableName: "projects", timestamps: false }
    );
}

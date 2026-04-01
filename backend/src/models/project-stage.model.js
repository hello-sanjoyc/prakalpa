import { DataTypes } from "sequelize";

export default function defineProjectStage(sequelize) {
    return sequelize.define(
        "ProjectStage",
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            stage_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
            },
            stage_slug: {
                type: DataTypes.STRING(128),
                allowNull: false,
                unique: true,
            },
            approved_by: { type: DataTypes.BIGINT, allowNull: true },
            approved_at: { type: DataTypes.DATE, allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "project_stages", timestamps: false }
    );
}

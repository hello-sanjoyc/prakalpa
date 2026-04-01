import { DataTypes } from "sequelize";

export default function defineApproval(sequelize) {
    return sequelize.define(
        "Approval",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            project_id: { type: DataTypes.BIGINT, allowNull: false },
            stage_id: { type: DataTypes.INTEGER, allowNull: true },
            approver_id: { type: DataTypes.BIGINT, allowNull: false },
            status: {
                type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
                defaultValue: "PENDING",
            },
            comments: { type: DataTypes.TEXT, allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            acted_at: { type: DataTypes.DATE, allowNull: true },
        },
        { tableName: "approvals", timestamps: false }
    );
}

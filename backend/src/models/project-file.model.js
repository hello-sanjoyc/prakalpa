import { DataTypes } from "sequelize";

export default function defineProjectFile(sequelize) {
    return sequelize.define(
        "ProjectFile",
        {
            id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            project_id: { type: DataTypes.BIGINT, allowNull: false },
            parent_id: { type: DataTypes.BIGINT, allowNull: true },
            uploaded_by: { type: DataTypes.BIGINT, allowNull: true },
            name: { type: DataTypes.STRING(512), allowNull: false },
            path: { type: DataTypes.STRING(1024), allowNull: false },
            is_folder: { type: DataTypes.BOOLEAN, defaultValue: false },
            share_scope: {
                type: DataTypes.ENUM("only_me", "all_members", "selected"),
                defaultValue: "only_me",
            },
            mime_type: { type: DataTypes.STRING(128), allowNull: true },
            size_bytes: { type: DataTypes.BIGINT, allowNull: true },
            shared_with: { type: DataTypes.JSON, allowNull: true },
            deleted_at: { type: DataTypes.DATE, allowNull: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "project_files", timestamps: false }
    );
}

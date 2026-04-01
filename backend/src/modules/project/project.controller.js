import { createReadStream } from "fs";
import archiver from "archiver";
import ProjectService from "./project.service.js";

function getSafeDownloadName(name, fallback = "file") {
    const safeBase = String(name || fallback).trim() || fallback;
    return safeBase.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function listProjects(req, reply) {
    const service = new ProjectService(req.server?.db);
    const page = req.query?.page;
    const limit = req.query?.limit;
    const sortBy = req.query?.sortBy;
    const sortOrder = req.query?.sortOrder;
    const search = req.query?.search;
    const includeDeleted = req.query?.includeDeleted;
    const { rows, total, page: currentPage, limit: pageLimit } =
        await service.list({
            page,
            limit,
            sortBy,
            sortOrder,
            search,
            includeDeleted,
        });
    const normalized = rows.map((p) => ({
        ...p,
        department_name: p.department_name || null,
        owner_name: p.owner_name || null,
        current_stage: p.stage_id
            ? {
                  id: p.stage_id,
                  stage_slug: p.stage_slug,
                  stage_order: p.stage_order,
              }
            : null,
    }));
    if (!normalized.length) {
        return reply.send({
            projects: [],
            message: "No project available",
            pagination: {
                page: currentPage,
                limit: pageLimit,
                total,
                totalPages: Math.ceil(total / pageLimit) || 1,
            },
        });
    }
    return reply.send({
        projects: normalized,
        pagination: {
            page: currentPage,
            limit: pageLimit,
            total,
            totalPages: Math.ceil(total / pageLimit) || 1,
        },
    });
}

export async function getProject(req, reply) {
    const service = new ProjectService(req.server?.db);
    const project = await service.getById(req.params.id);
    return reply.send({ project });
}

export async function createProject(req, reply) {
    const service = new ProjectService(req.server?.db);
    const project = await service.create(req.body);
    return reply.code(201).send({ project });
}

export async function updateProject(req, reply) {
    const service = new ProjectService(req.server?.db);
    const project = await service.update(req.params.id, req.body);
    return reply.send({ project });
}

export async function deleteProject(req, reply) {
    const service = new ProjectService(req.server?.db);
    const result = await service.softDelete(req.params.id);
    return reply.send(result);
}

export async function listProjectMilestones(req, reply) {
    const service = new ProjectService(req.server?.db);
    const { rows, total, page, limit } = await service.listMilestones({
        projectId: req.params.id,
        page: req.query?.page,
        limit: req.query?.limit,
        sortBy: req.query?.sortBy,
        sortOrder: req.query?.sortOrder,
        search: req.query?.search,
    });
    if (!rows.length) {
        return reply.send({
            milestones: [],
            message: "No milestones available",
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        });
    }
    return reply.send({
        milestones: rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    });
}

export async function createProjectMilestone(req, reply) {
    const service = new ProjectService(req.server?.db);
    const milestone = await service.createMilestone(req.params.id, req.body);
    return reply.code(201).send({ milestone });
}

export async function updateProjectMilestone(req, reply) {
    const service = new ProjectService(req.server?.db);
    const milestone = await service.updateMilestone(
        req.params.id,
        req.params.milestoneId,
        req.body
    );
    return reply.send({ milestone });
}

export async function deleteProjectMilestone(req, reply) {
    const service = new ProjectService(req.server?.db);
    const result = await service.deleteMilestone(
        req.params.id,
        req.params.milestoneId
    );
    return reply.send(result);
}

export async function listProjectTasks(req, reply) {
    const service = new ProjectService(req.server?.db);
    const { rows, total, page, limit } = await service.listTasks({
        projectId: req.params.id,
        page: req.query?.page,
        limit: req.query?.limit,
        sortBy: req.query?.sortBy,
        sortOrder: req.query?.sortOrder,
        search: req.query?.search,
    });
    if (!rows.length) {
        return reply.send({
            tasks: [],
            message: "No tasks available",
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        });
    }
    return reply.send({
        tasks: rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    });
}

export async function createProjectTask(req, reply) {
    const service = new ProjectService(req.server?.db);
    const task = await service.createTask(req.params.id, req.body);
    return reply.code(201).send({ task });
}

export async function updateProjectTask(req, reply) {
    const service = new ProjectService(req.server?.db);
    const task = await service.updateTask(
        req.params.id,
        req.params.taskId,
        req.body
    );
    return reply.send({ task });
}

export async function deleteProjectTask(req, reply) {
    const service = new ProjectService(req.server?.db);
    const result = await service.deleteTask(
        req.params.id,
        req.params.taskId
    );
    return reply.send(result);
}

export async function listProjectActions(req, reply) {
    const service = new ProjectService(req.server?.db);
    const { rows, total, page, limit } = await service.listActions({
        projectId: req.params.id,
        page: req.query?.page,
        limit: req.query?.limit,
        sortBy: req.query?.sortBy,
        sortOrder: req.query?.sortOrder,
        search: req.query?.search,
    });
    if (!rows.length) {
        return reply.send({
            actions: [],
            message: "No activities available",
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        });
    }
    return reply.send({
        actions: rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    });
}

export async function listProjectFinances(req, reply) {
    const service = new ProjectService(req.server?.db);
    const { rows, total, page, limit } = await service.listFinances({
        projectId: req.params.id,
        page: req.query?.page,
        limit: req.query?.limit,
        sortBy: req.query?.sortBy,
        sortOrder: req.query?.sortOrder,
        search: req.query?.search,
    });
    if (!rows.length) {
        return reply.send({
            finances: [],
            message: "No finance entries available",
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        });
    }
    return reply.send({
        finances: rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    });
}

export async function createProjectFinance(req, reply) {
    const service = new ProjectService(req.server?.db);
    const finance = await service.createFinance(req.params.id, req.body);
    return reply.code(201).send({ finance });
}

export async function updateProjectFinance(req, reply) {
    const service = new ProjectService(req.server?.db);
    const finance = await service.updateFinance(
        req.params.id,
        req.params.financeId,
        req.body
    );
    return reply.send({ finance });
}

export async function deleteProjectFinance(req, reply) {
    const service = new ProjectService(req.server?.db);
    const result = await service.deleteFinance(
        req.params.id,
        req.params.financeId
    );
    return reply.send(result);
}

export async function createProjectAction(req, reply) {
    const service = new ProjectService(req.server?.db);
    const action = await service.createAction(req.params.id, req.body);
    return reply.code(201).send({ action });
}

export async function listProjectFiles(req, reply) {
    const service = new ProjectService(req.server?.db);
    const { rows, total, page, limit } = await service.listProjectFiles({
        projectId: req.params.id,
        page: req.query?.page,
        limit: req.query?.limit,
        search: req.query?.search,
        parentId: req.query?.parent_id,
    });
    if (!rows.length) {
        return reply.send({
            files: [],
            message: "No files available",
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        });
    }
    return reply.send({
        files: rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    });
}

export async function createProjectFolder(req, reply) {
    const service = new ProjectService(req.server?.db);
    const folder = await service.createProjectFolder(
        req.params.id,
        req.body,
        req.user?.id || null
    );
    return reply.code(201).send({ folder });
}

export async function uploadProjectFile(req, reply) {
    const service = new ProjectService(req.server?.db);
    const fields = {};
    let filePart = null;
    for await (const part of req.parts()) {
        if (part.type === "file") {
            if (part.fieldname === "file") {
                const buffer = await part.toBuffer();
                filePart = {
                    buffer,
                    filename: part.filename,
                    mimetype: part.mimetype,
                };
            } else {
                await part.toBuffer();
            }
        } else {
            fields[part.fieldname] = part.value;
        }
    }
    const file = await service.uploadProjectFile(
        req.params.id,
        filePart,
        fields,
        req.user?.id || null
    );
    return reply.code(201).send({ file });
}

export async function deleteProjectFile(req, reply) {
    const service = new ProjectService(req.server?.db);
    const result = await service.softDeleteProjectFile(
        req.params.id,
        req.params.fileId,
        req.user?.id || null
    );
    return reply.send(result);
}

export async function downloadProjectFile(req, reply) {
    const service = new ProjectService(req.server?.db);
    const { file, diskPath } = await service.getProjectFileForDownload(
        req.params.id,
        req.params.fileId
    );

    const baseName = getSafeDownloadName(file.name, file.is_folder ? "folder" : "file");
    reply.header("Cache-Control", "no-store");

    if (file.is_folder) {
        const zipName = baseName.endsWith(".zip") ? baseName : `${baseName}.zip`;
        reply.header("Content-Type", "application/zip");
        reply.header("Content-Disposition", `attachment; filename="${zipName}"`);

        const archive = archiver("zip", { zlib: { level: 9 } });
        archive.on("error", (err) => {
            reply.log.error(err);
            if (!reply.sent) {
                reply.code(500).send({ message: "Failed to create zip file" });
            }
        });
        archive.directory(diskPath, false);
        archive.finalize();
        return reply.send(archive);
    }

    reply.header(
        "Content-Disposition",
        `attachment; filename="${baseName}"`
    );
    reply.header("Content-Type", file.mime_type || "application/octet-stream");
    return reply.send(createReadStream(diskPath));
}

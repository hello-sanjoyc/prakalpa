import { createReadStream } from "fs";
import archiver from "archiver";
import ProjectService from "./project.service.js";
import { hashIdFields, toMd5 } from "../../lib/id-hash.js";

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
    const member = req.query?.member;
    const includeDeleted = req.query?.includeDeleted;
    const {
        rows,
        total,
        page: currentPage,
        limit: pageLimit,
    } = await service.list({
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        member,
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
        projects: hashIdFields(normalized),
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
    const project = await service.getById(toMd5(req.params.id));
    return reply.send({ project: hashIdFields(project) });
}

export async function createProject(req, reply) {
    const service = new ProjectService(req.server?.db);
    const project = await service.create(req.body);
    return reply.code(201).send({ project: hashIdFields(project) });
}

export async function updateProject(req, reply) {
    const service = new ProjectService(req.server?.db);
    const project = await service.update(toMd5(req.params.id), req.body);
    return reply.send({ project: hashIdFields(project) });
}

export async function deleteProject(req, reply) {
    const service = new ProjectService(req.server?.db);
    const result = await service.softDelete(toMd5(req.params.id));
    return reply.send(result);
}

export async function listProjectMilestones(req, reply) {
    const service = new ProjectService(req.server?.db);
    const { rows, total, page, limit } = await service.listMilestones({
        projectId: toMd5(req.params.id),
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
        milestones: hashIdFields(rows),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    });
}

export async function listProjectMembers(req, reply) {
    const service = new ProjectService(req.server?.db);
    const excludeMemberId = req.query?.exclude_member_id;
    const members = await service.listMembers({
        projectId: toMd5(req.params.id),
        excludeMemberId: excludeMemberId ? toMd5(excludeMemberId) : excludeMemberId,
    });
    return reply.send({ members: hashIdFields(members) });
}

export async function createProjectMilestone(req, reply) {
    const service = new ProjectService(req.server?.db);
    const milestone = await service.createMilestone(toMd5(req.params.id), req.body);
    return reply.code(201).send({ milestone: hashIdFields(milestone) });
}

export async function updateProjectMilestone(req, reply) {
    const service = new ProjectService(req.server?.db);
    const milestone = await service.updateMilestone(
        toMd5(req.params.id),
        toMd5(req.params.milestoneId),
        req.body,
    );
    return reply.send({ milestone: hashIdFields(milestone) });
}

export async function deleteProjectMilestone(req, reply) {
    const service = new ProjectService(req.server?.db);
    const result = await service.deleteMilestone(
        toMd5(req.params.id),
        toMd5(req.params.milestoneId),
    );
    return reply.send(result);
}

export async function listProjectTasks(req, reply) {
    const service = new ProjectService(req.server?.db);
    const { rows, total, page, limit } = await service.listTasks({
        projectId: toMd5(req.params.id),
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
        tasks: hashIdFields(rows),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    });
}

export async function listTaskDashboard(req, reply) {
    const service = new ProjectService(req.server?.db);
    const summary = await service.getTaskDashboardSummary({
        projectId: req.query?.project_id ? toMd5(req.query.project_id) : req.query?.project_id,
        memberId: req.query?.member_id ? toMd5(req.query.member_id) : req.query?.member_id,
        memberScope: req.query?.member_scope,
        status: req.query?.status,
        priority: req.query?.priority,
        authUserId: req.user?.sub || null,
    });
    return reply.send({ summary });
}

export async function createProjectTask(req, reply) {
    const service = new ProjectService(req.server?.db);
    const task = await service.createTask(toMd5(req.params.id), req.body);
    return reply.code(201).send({ task: hashIdFields(task) });
}

export async function updateProjectTask(req, reply) {
    const service = new ProjectService(req.server?.db);
    const task = await service.updateTask(
        toMd5(req.params.id),
        toMd5(req.params.taskId),
        req.body,
    );
    return reply.send({ task: hashIdFields(task) });
}

export async function deleteProjectTask(req, reply) {
    const service = new ProjectService(req.server?.db);
    const result = await service.deleteTask(toMd5(req.params.id), toMd5(req.params.taskId));
    return reply.send(result);
}

export async function listProjectActions(req, reply) {
    const service = new ProjectService(req.server?.db);
    const { rows, total, page, limit } = await service.listActions({
        projectId: toMd5(req.params.id),
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
        actions: hashIdFields(rows),
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
        projectId: toMd5(req.params.id),
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
        finances: hashIdFields(rows),
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
    const finance = await service.createFinance(toMd5(req.params.id), req.body);
    return reply.code(201).send({ finance: hashIdFields(finance) });
}

export async function updateProjectFinance(req, reply) {
    const service = new ProjectService(req.server?.db);
    const finance = await service.updateFinance(
        toMd5(req.params.id),
        toMd5(req.params.financeId),
        req.body,
    );
    return reply.send({ finance: hashIdFields(finance) });
}

export async function deleteProjectFinance(req, reply) {
    const service = new ProjectService(req.server?.db);
    const result = await service.deleteFinance(
        toMd5(req.params.id),
        toMd5(req.params.financeId),
    );
    return reply.send(result);
}

export async function createProjectAction(req, reply) {
    const service = new ProjectService(req.server?.db);
    const action = await service.createAction(toMd5(req.params.id), req.body);
    return reply.code(201).send({ action: hashIdFields(action) });
}

export async function listProjectFiles(req, reply) {
    const service = new ProjectService(req.server?.db);
    const parentIdRaw = req.query?.parent_id;
    const { rows, total, page, limit } = await service.listProjectFiles({
        projectId: toMd5(req.params.id),
        page: req.query?.page,
        limit: req.query?.limit,
        search: req.query?.search,
        parentId:
            parentIdRaw === null ||
            parentIdRaw === undefined ||
            parentIdRaw === "" ||
            parentIdRaw === "null"
                ? parentIdRaw
                : toMd5(parentIdRaw),
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
        files: hashIdFields(rows),
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
        toMd5(req.params.id),
        req.body,
        req.user?.id || null,
    );
    return reply.code(201).send({ folder: hashIdFields(folder) });
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
        toMd5(req.params.id),
        filePart,
        fields,
        req.user?.id || null,
    );
    return reply.code(201).send({ file: hashIdFields(file) });
}

export async function deleteProjectFile(req, reply) {
    const service = new ProjectService(req.server?.db);
    const result = await service.softDeleteProjectFile(
        toMd5(req.params.id),
        toMd5(req.params.fileId),
        req.user?.id || null,
    );
    return reply.send(result);
}

export async function downloadProjectFile(req, reply) {
    const service = new ProjectService(req.server?.db);
    const { file, diskPath } = await service.getProjectFileForDownload(
        toMd5(req.params.id),
        toMd5(req.params.fileId),
    );

    const baseName = getSafeDownloadName(
        file.name,
        file.is_folder ? "folder" : "file",
    );
    reply.header("Cache-Control", "no-store");

    if (file.is_folder) {
        const zipName = baseName.endsWith(".zip")
            ? baseName
            : `${baseName}.zip`;
        reply.header("Content-Type", "application/zip");
        reply.header(
            "Content-Disposition",
            `attachment; filename="${zipName}"`,
        );

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

    reply.header("Content-Disposition", `attachment; filename="${baseName}"`);
    reply.header("Content-Type", file.mime_type || "application/octet-stream");
    return reply.send(createReadStream(diskPath));
}

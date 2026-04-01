import {
    createProject,
    createProjectAction,
    createProjectMilestone,
    createProjectTask,
    createProjectFolder,
    createProjectFinance,
    updateProjectFinance,
    deleteProjectFinance,
    downloadProjectFile,
    deleteProjectFile,
    deleteProjectMilestone,
    deleteProjectTask,
    deleteProject,
    getProject,
    listProjectFiles,
    listProjectFinances,
    listProjectActions,
    listProjectMilestones,
    listProjectTasks,
    listProjects,
    uploadProjectFile,
    updateProjectMilestone,
    updateProjectTask,
    updateProject,
} from "./project.controller.js";
import {
    createProjectSchema,
    createProjectActionSchema,
    createProjectMilestoneSchema,
    createProjectTaskSchema,
    createProjectFolderSchema,
    createProjectFinanceSchema,
    updateProjectFinanceSchema,
    deleteProjectFinanceSchema,
    deleteProjectMilestoneSchema,
    deleteProjectTaskSchema,
    deleteProjectFileSchema,
    downloadProjectFileSchema,
    listProjectFilesSchema,
    listProjectFinancesSchema,
    listProjectsSchema,
    listProjectActionsSchema,
    listProjectMilestonesSchema,
    listProjectTasksSchema,
    projectIdParamSchema,
    uploadProjectFileSchema,
    updateProjectMilestoneSchema,
    updateProjectTaskSchema,
    updateProjectSchema,
} from "./project.schema.js";

export default async function projectRoutes(fastify) {
    const auth = fastify.authenticate;
    const allowAdmin = fastify.authorize(["super_admin", "department_admin"]);

    fastify.get(
        "/",
        { schema: listProjectsSchema, preHandler: [auth] },
        listProjects
    );

    fastify.get(
        "/:id",
        { schema: projectIdParamSchema, preHandler: [auth] },
        getProject
    );

    fastify.post(
        "/",
        {
            schema: createProjectSchema,
            preHandler: [auth, allowAdmin],
        },
        createProject
    );

    fastify.put(
        "/:id",
        { schema: updateProjectSchema, preHandler: [auth, allowAdmin] },
        updateProject
    );

    fastify.delete(
        "/:id",
        { schema: projectIdParamSchema, preHandler: [auth, allowAdmin] },
        deleteProject
    );

    fastify.get(
        "/:id/milestones",
        { schema: listProjectMilestonesSchema, preHandler: [auth] },
        listProjectMilestones
    );
    fastify.post(
        "/:id/milestones",
        { schema: createProjectMilestoneSchema, preHandler: [auth, allowAdmin] },
        createProjectMilestone
    );
    fastify.put(
        "/:id/milestones/:milestoneId",
        { schema: updateProjectMilestoneSchema, preHandler: [auth, allowAdmin] },
        updateProjectMilestone
    );
    fastify.delete(
        "/:id/milestones/:milestoneId",
        { schema: deleteProjectMilestoneSchema, preHandler: [auth, allowAdmin] },
        deleteProjectMilestone
    );

    fastify.get(
        "/:id/tasks",
        { schema: listProjectTasksSchema, preHandler: [auth] },
        listProjectTasks
    );
    fastify.post(
        "/:id/tasks",
        { schema: createProjectTaskSchema, preHandler: [auth, allowAdmin] },
        createProjectTask
    );
    fastify.put(
        "/:id/tasks/:taskId",
        { schema: updateProjectTaskSchema, preHandler: [auth, allowAdmin] },
        updateProjectTask
    );
    fastify.delete(
        "/:id/tasks/:taskId",
        { schema: deleteProjectTaskSchema, preHandler: [auth, allowAdmin] },
        deleteProjectTask
    );

    fastify.get(
        "/:id/actions",
        { schema: listProjectActionsSchema, preHandler: [auth] },
        listProjectActions
    );
    fastify.post(
        "/:id/actions",
        { schema: createProjectActionSchema, preHandler: [auth, allowAdmin] },
        createProjectAction
    );

    fastify.get(
        "/:id/finances",
        { schema: listProjectFinancesSchema, preHandler: [auth] },
        listProjectFinances
    );
    fastify.post(
        "/:id/finances",
        { schema: createProjectFinanceSchema, preHandler: [auth, allowAdmin] },
        createProjectFinance
    );
    fastify.put(
        "/:id/finances/:financeId",
        { schema: updateProjectFinanceSchema, preHandler: [auth, allowAdmin] },
        updateProjectFinance
    );
    fastify.delete(
        "/:id/finances/:financeId",
        { schema: deleteProjectFinanceSchema, preHandler: [auth, allowAdmin] },
        deleteProjectFinance
    );

    fastify.get(
        "/:id/files",
        { schema: listProjectFilesSchema, preHandler: [auth] },
        listProjectFiles
    );
    fastify.post(
        "/:id/files/folder",
        { schema: createProjectFolderSchema, preHandler: [auth, allowAdmin] },
        createProjectFolder
    );
    fastify.post(
        "/:id/files/upload",
        { schema: uploadProjectFileSchema, preHandler: [auth, allowAdmin] },
        uploadProjectFile
    );
    fastify.get(
        "/:id/files/:fileId/download",
        { schema: downloadProjectFileSchema, preHandler: [auth] },
        downloadProjectFile
    );
    fastify.delete(
        "/:id/files/:fileId",
        { schema: deleteProjectFileSchema, preHandler: [auth, allowAdmin] },
        deleteProjectFile
    );
}

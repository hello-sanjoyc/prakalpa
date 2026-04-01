import ProjectMemberRoleService from "./project-member-role.service.js";

export async function listProjectMemberRoles(req, reply) {
    const service = new ProjectMemberRoleService(req.server?.db);
    const roles = await service.list(req.query?.project_id);
    return reply.send({ roles });
}

export async function createProjectMemberRole(req, reply) {
    const service = new ProjectMemberRoleService(req.server?.db);
    const role = await service.create(req.body || {});
    return reply.code(201).send({ role });
}

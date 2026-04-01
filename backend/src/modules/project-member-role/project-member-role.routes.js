import {
    createProjectMemberRole,
    listProjectMemberRoles,
} from "./project-member-role.controller.js";
import {
    createProjectMemberRoleSchema,
    listProjectMemberRolesSchema,
} from "./project-member-role.schema.js";

export default async function projectMemberRoleRoutes(fastify) {
    const auth = fastify.authenticate;
    const allowAdmin = fastify.authorize(["super_admin", "department_admin"]);

    fastify.get(
        "/",
        { schema: listProjectMemberRolesSchema, preHandler: [auth] },
        listProjectMemberRoles
    );
    fastify.post(
        "/",
        { schema: createProjectMemberRoleSchema, preHandler: [auth, allowAdmin] },
        createProjectMemberRole
    );
}

import {
    createMember,
    deleteMember,
    getMember,
    listMembers,
    updateMember,
} from "./member.controller.js";
import {
    createMemberSchema,
    deleteMemberSchema,
    getMemberSchema,
    listMemberSchema,
    updateMemberSchema,
} from "./member.schema.js";

export default async function memberRoutes(fastify) {
    fastify.get("/", { schema: listMemberSchema }, listMembers);
    fastify.get("/:id", { schema: getMemberSchema }, getMember);
    fastify.post("/", { schema: createMemberSchema }, createMember);
    fastify.put("/:id", { schema: updateMemberSchema }, updateMember);
    fastify.delete("/:id", { schema: deleteMemberSchema }, deleteMember);
}

import { login, memberOptions, roleOptions } from "./auth.controller.js";
import {
    loginSchema,
    memberOptionsSchema,
    roleOptionsSchema,
} from "./auth.schema.js";

export default async function authRoutes(fastify) {
    fastify.post("/login", { schema: loginSchema }, login);
    fastify.get(
        "/members/options",
        { schema: memberOptionsSchema },
        memberOptions
    );
    fastify.get("/roles/options", { schema: roleOptionsSchema }, roleOptions);
}

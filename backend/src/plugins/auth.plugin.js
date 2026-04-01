// backend/src/plugins/auth.plugin.js
import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { env } from "../config/index.js";

async function authPlugin(fastify) {
    fastify.register(fastifyJwt, { secret: env.JWT_ACCESS_SECRET });

    fastify.decorate("authenticate", async (req, reply) => {
        try {
            await req.jwtVerify(); // sets req.user
        } catch (err) {
            return reply.code(401).send({ message: "Unauthorized" });
        }
    });

    fastify.decorate("authorize", (roles = []) => async (req, reply) => {
        if (!req.user) await req.jwtVerify();
        console.log("ROLE", req.user.role);
        if (roles.length && !roles.includes(req.user.role)) {
            return reply.code(403).send({ message: "Forbidden" });
        }
    });
}

export default fp(authPlugin);

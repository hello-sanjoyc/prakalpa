import fp from "fastify-plugin";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import authPlugin from "./auth.plugin.js";
import dbPlugin from "./db.plugin.js";
import requestContextPlugin from "./request-context.plugin.js";
import rateLimitPlugin from "./rate-limit.plugin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.resolve(__dirname, "..", "..", "upload");

async function plugins(fastify, opts) {
    await fastify.register(multipart, {
        limits: { fileSize: 20 * 1024 * 1024 },
    });
    await fastify.register(fastifyStatic, {
        root: uploadRoot,
        prefix: "/upload/",
        decorateReply: false,
        setHeaders(res) {
            res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        },
    });
    await fastify.register(dbPlugin);
    await fastify.register(authPlugin);
    await fastify.register(requestContextPlugin);
    await fastify.register(rateLimitPlugin);
}

export default fp(plugins);

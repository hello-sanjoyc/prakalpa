import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";

async function rateLimitPlugin(fastify, opts) {
    fastify.register(rateLimit, { max: 100, timeWindow: "1 minute" });
}

export default fp(rateLimitPlugin);

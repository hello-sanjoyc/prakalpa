import { readiness } from "../../bootstrap/readiness.js";

export default async function healthRoutes(fastify) {
    fastify.get("/health", async () => ({ status: "ok" }));
    fastify.get("/ready", async () => readiness());
}

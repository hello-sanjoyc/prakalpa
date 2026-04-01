import fp from "fastify-plugin";

async function requestContext(fastify, opts) {
    fastify.addHook("onRequest", async (req, reply) => {
        req.requestContext = {
            requestId: req.headers["x-request-id"] || null,
        };
    });
}

export default fp(requestContext);

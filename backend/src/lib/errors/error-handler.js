export function errorHandler(err, req, reply) {
    if (req?.log && err) {
        req.log.error(err);
    }
    if (err && err.statusCode) {
        return reply.status(err.statusCode).send({ error: err.message });
    }
    return reply.status(500).send({ error: "Internal Server Error" });
}

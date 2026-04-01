export const asyncHandler = (fn) => async (req, reply) => {
    try {
        return await fn(req, reply);
    } catch (err) {
        req.log.error(err);
        reply.send(err);
    }
};

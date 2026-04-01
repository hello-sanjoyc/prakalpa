import AuthService from "./auth.service.js";

export async function login(req, reply) {
    const authService = new AuthService(req.server?.db?.sequelize);
    try {
        const result = await authService.login(req.body);
        return reply.send(result);
    } catch (err) {
        req.log.error({ err }, "Login failed");
        const statusCode = err.statusCode || 401;
        return reply.status(statusCode).send({ message: err.message });
    }
}

export async function memberOptions(req, reply) {
    const authService = new AuthService(req.server?.db?.sequelize);
    try {
        const members = await authService.memberOptions(req.query || {});
        return reply.send({ members });
    } catch (err) {
        req.log.error({ err }, "Member options failed");
        const statusCode = err.statusCode || 500;
        return reply.status(statusCode).send({ message: err.message });
    }
}

export async function roleOptions(req, reply) {
    const authService = new AuthService(req.server?.db?.sequelize);
    try {
        const roles = await authService.roleOptions();
        return reply.send({ roles });
    } catch (err) {
        req.log.error({ err }, "Role options failed");
        const statusCode = err.statusCode || 500;
        return reply.status(statusCode).send({ message: err.message });
    }
}

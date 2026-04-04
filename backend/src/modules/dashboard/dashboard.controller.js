import DashboardService from "./dashboard.service.js";

export async function getDashboardOverview(req, reply) {
    const service = new DashboardService(req.server?.db);
    const overview = await service.getOverview({
        period: req.query?.period,
        department_id: req.query?.department_id,
        authUserId: req.user?.sub,
    });
    return reply.send({ overview });
}

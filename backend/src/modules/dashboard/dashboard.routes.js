import { getDashboardOverview } from "./dashboard.controller.js";
import { dashboardOverviewSchema } from "./dashboard.schema.js";

export default async function dashboardRoutes(fastify) {
    const auth = fastify.authenticate;

    fastify.get(
        "/",
        { schema: dashboardOverviewSchema, preHandler: [auth] },
        getDashboardOverview,
    );
}

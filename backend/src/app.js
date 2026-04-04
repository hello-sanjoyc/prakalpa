import Fastify from "fastify";
import compress from "@fastify/compress";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

import { logger } from "./config/index.js";
import plugins from "./plugins/index.js";

import authRoutes from "./modules/auth/auth.routes.js";
import memberRoutes from "./modules/member/member.routes.js";
import projectRoutes from "./modules/project/project.routes.js";
import projectMemberRoleRoutes from "./modules/project-member-role/project-member-role.routes.js";
import departmentRoutes from "./modules/department/department.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import healthRoutes from "./modules/health/health.routes.js";

import { errorHandler } from "./lib/errors/error-handler.js";

export async function buildApp(opts = {}) {
    const app = Fastify({
        logger: opts.logger ?? logger,
        ignoreTrailingSlash: true,
    });

    await app.register(compress);
    await app.register(cors);
    await app.register(helmet);

    await app.register(plugins);

    //PREFIXES LIVE HERE — NOWHERE ELSE
    await app.register(healthRoutes, { prefix: "/api" });
    await app.register(authRoutes, { prefix: "/api/auth" });
    await app.register(memberRoutes, { prefix: "/api/members" });
    await app.register(projectRoutes, { prefix: "/api/projects" });
    await app.register(projectMemberRoleRoutes, { prefix: "/api/project-member-roles" });
    await app.register(departmentRoutes, { prefix: "/api/departments" });
    await app.register(dashboardRoutes, { prefix: "/api/dashboard" });

    app.setErrorHandler(errorHandler);

    console.log(app.printRoutes());

    return app;
}

export default buildApp;

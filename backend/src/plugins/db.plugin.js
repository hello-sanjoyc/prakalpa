import fp from "fastify-plugin";
import { Sequelize } from "sequelize";
import { env } from "../config/index.js";

async function dbPlugin(fastify, opts) {
    const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
        host: env.DB_HOST,
        port: env.DB_PORT,
        dialect: env.DB_DIALECT,
        logging: env.DB_LOGGING ? fastify.log.info.bind(fastify.log) : false,
        pool: {
            max: env.DB_POOL.MAX,
            min: env.DB_POOL.MIN,
            acquire: env.DB_POOL.ACQUIRE,
            idle: env.DB_POOL.IDLE,
        },
        timezone: env.DB_TIMEZONE,
        define: { underscored: true },
    });

    await sequelize.authenticate();
    fastify.decorate("db", { sequelize });

    fastify.addHook("onClose", async () => {
        await sequelize.close();
    });
}

export default fp(dbPlugin);

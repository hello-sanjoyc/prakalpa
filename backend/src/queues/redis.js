import IORedis from "ioredis";
import { env, logger } from "../config/index.js";

export function createRedisConnection() {
    if (env.REDIS_URL) {
        return new IORedis(env.REDIS_URL, {
            maxRetriesPerRequest: null,
        });
    }
    return new IORedis({
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
    });
}

export function isRedisConfigured() {
    if (env.REDIS_URL) return true;
    return Boolean(env.REDIS_HOST && env.REDIS_PORT);
}

export function logRedisWarning(context = "") {
    const suffix = context ? ` (${context})` : "";
    logger.warn(`Redis is not configured${suffix}; skipping queue operation.`);
}

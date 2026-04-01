import { Queue } from "bullmq";
import { env } from "../config/index.js";
import {
    createRedisConnection,
    isRedisConfigured,
    logRedisWarning,
} from "./redis.js";

let emailQueue = null;

export function getEmailQueue() {
    if (!isRedisConfigured()) {
        logRedisWarning("email queue");
        return null;
    }
    if (!emailQueue) {
        emailQueue = new Queue(env.EMAIL_QUEUE_NAME || "email_jobs", {
            connection: createRedisConnection(),
        });
    }
    return emailQueue;
}

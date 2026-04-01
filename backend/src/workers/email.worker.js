import path from "path";
import ejs from "ejs";
import nodemailer from "nodemailer";
import { Worker } from "bullmq";
import { env, logger } from "../config/index.js";
import {
    createRedisConnection,
    isRedisConfigured,
    logRedisWarning,
} from "../queues/redis.js";

function resolveTemplate(templatePath) {
    if (!templatePath) return null;
    return path.isAbsolute(templatePath)
        ? templatePath
        : path.resolve(process.cwd(), templatePath);
}

function buildTransporter() {
    if (!env.SMTP_HOST || !env.SMTP_USER) {
        return null;
    }
    return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: Number(env.SMTP_PORT) === 465,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    });
}

if (!isRedisConfigured()) {
    logRedisWarning("email worker");
    process.exit(0);
}

const transporter = buildTransporter();
if (!transporter) {
    logger.warn("SMTP not configured; email worker will exit.");
    process.exit(0);
}

const queueName = env.EMAIL_QUEUE_NAME || "email_jobs";
const connection = createRedisConnection();

const worker = new Worker(
    queueName,
    async (job) => {
        const { to, subject, template, context, from } = job.data || {};
        if (!to || !subject || !template) {
            throw new Error("Missing email job data");
        }
        const templatePath = resolveTemplate(template);
        const html = await ejs.renderFile(templatePath, context || {});
        await transporter.sendMail({
            to,
            subject,
            html,
            from: from || env.SMTP_FROM || env.SMTP_USER,
        });
    },
    { connection }
);

worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Email job completed");
});

worker.on("failed", (job, err) => {
    logger.error(
        { jobId: job?.id, err: err?.message },
        "Email job failed"
    );
});

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Attempt to load zod for schema-based validation; fall back to manual checks
let z;
try {
    ({ z } = await import("zod"));
} catch {
    z = null;
}

const rawEnv = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "4000",
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    APP_NAME: process.env.APP_NAME || "Prakalpa",
    BASE_URL: process.env.BASE_URL || "http://localhost:4000",
    APP_URL: process.env.APP_URL || "http://localhost:5173",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "dev-access",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev-refresh",
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    DB_HOST: process.env.DB_HOST || "127.0.0.1",
    DB_PORT: process.env.DB_PORT || "3306",
    DB_USER: process.env.DB_USER || "root",
    DB_PASS: process.env.DB_PASS || process.env.DB_PASSWORD || "",
    DB_NAME: process.env.DB_NAME || "pms",
    DB_DIALECT: process.env.DB_DIALECT || "mysql",
    DB_LOGGING: process.env.DB_LOGGING || "false",
    DB_TIMEZONE: process.env.DB_TIMEZONE || "+00:00",
    DB_POOL_MAX: process.env.DB_POOL_MAX || "10",
    DB_POOL_MIN: process.env.DB_POOL_MIN || "0",
    DB_POOL_ACQUIRE: process.env.DB_POOL_ACQUIRE || "30000",
    DB_POOL_IDLE: process.env.DB_POOL_IDLE || "10000",
    SMTP_HOST: process.env.SMTP_HOST || "",
    SMTP_PORT: process.env.SMTP_PORT || "",
    SMTP_USER: process.env.SMTP_USER || "",
    SMTP_PASS: process.env.SMTP_PASS || "",
    SMTP_FROM: process.env.SMTP_FROM || "",
    CONTACT_NOTIFICATION_EMAIL: process.env.CONTACT_NOTIFICATION_EMAIL || "",
    REDIS_URL: process.env.REDIS_URL || "",
    REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
    REDIS_PORT: process.env.REDIS_PORT || "6379",
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
    EMAIL_QUEUE_NAME: process.env.EMAIL_QUEUE_NAME || "email_jobs",
};

const schema =
    z &&
    z.object({
        NODE_ENV: z.string().default("development"),
        PORT: z.coerce.number().int().positive().default(4000),
        LOG_LEVEL: z.string().default("info"),
        APP_NAME: z.string().default("AxPMS"),
        BASE_URL: z.string().url().default("http://localhost:4000"),
        JWT_ACCESS_SECRET: z.string().min(1),
        JWT_REFRESH_SECRET: z.string().min(1),
        ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
        REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
        DB_HOST: z.string().default("127.0.0.1"),
        DB_PORT: z.coerce.number().int().default(3306),
        DB_USER: z.string().default("root"),
        DB_PASS: z.string().default(""),
        DB_NAME: z.string().default("pms"),
        DB_DIALECT: z.string().default("mysql"),
        DB_LOGGING: z
            .enum(["true", "false"])
            .default("false")
            .transform((val) => val === "true"),
        DB_TIMEZONE: z.string().default("+00:00"),
        DB_POOL_MAX: z.coerce.number().int().default(10),
        DB_POOL_MIN: z.coerce.number().int().default(0),
        DB_POOL_ACQUIRE: z.coerce.number().int().default(30000),
        DB_POOL_IDLE: z.coerce.number().int().default(10000),
        SMTP_HOST: z.string().default(""),
        SMTP_PORT: z.coerce.number().int().default(587),
        SMTP_USER: z.string().default(""),
        SMTP_PASS: z.string().default(""),
        SMTP_FROM: z.string().default(""),
        CONTACT_NOTIFICATION_EMAIL: z.string().default(""),
        REDIS_URL: z.string().default(""),
        REDIS_HOST: z.string().default("127.0.0.1"),
        REDIS_PORT: z.coerce.number().int().default(6379),
        REDIS_PASSWORD: z.string().default(""),
        EMAIL_QUEUE_NAME: z.string().default("email_jobs"),
    });

const parsed =
    schema?.safeParse(rawEnv).success === true
        ? schema.parse(rawEnv)
        : fallbackValidate(rawEnv);

function fallbackValidate(values) {
    if (!values.JWT_ACCESS_SECRET || !values.JWT_REFRESH_SECRET) {
        throw new Error("JWT secrets are required");
    }
    const toNumber = (val, def) => {
        const num = Number(val);
        return Number.isFinite(num) ? num : def;
    };
    return {
        ...values,
        PORT: toNumber(values.PORT, 4000),
        DB_PORT: toNumber(values.DB_PORT, 3306),
        DB_LOGGING: values.DB_LOGGING === "true",
        DB_POOL_MAX: toNumber(values.DB_POOL_MAX, 10),
        DB_POOL_MIN: toNumber(values.DB_POOL_MIN, 0),
        DB_POOL_ACQUIRE: toNumber(values.DB_POOL_ACQUIRE, 30000),
        DB_POOL_IDLE: toNumber(values.DB_POOL_IDLE, 10000),
        SMTP_HOST: values.SMTP_HOST || "",
        SMTP_PORT: toNumber(values.SMTP_PORT, 587),
        SMTP_USER: values.SMTP_USER || "",
        SMTP_PASS: values.SMTP_PASS || "",
        SMTP_FROM: values.SMTP_FROM || "",
        CONTACT_NOTIFICATION_EMAIL: values.CONTACT_NOTIFICATION_EMAIL || "",
        REDIS_URL: values.REDIS_URL || "",
        REDIS_HOST: values.REDIS_HOST || "127.0.0.1",
        REDIS_PORT: toNumber(values.REDIS_PORT, 6379),
        REDIS_PASSWORD: values.REDIS_PASSWORD || "",
        EMAIL_QUEUE_NAME: values.EMAIL_QUEUE_NAME || "email_jobs",
    };
}

export const env = {
    ...parsed,
    DB_POOL: {
        MAX: parsed.DB_POOL_MAX,
        MIN: parsed.DB_POOL_MIN,
        ACQUIRE: parsed.DB_POOL_ACQUIRE,
        IDLE: parsed.DB_POOL_IDLE,
    },
};

export default env;

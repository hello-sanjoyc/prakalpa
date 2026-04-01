import fs from "fs";
import path from "path";
import pino from "pino";
import env from "./env.js";

const logLevel = env.LOG_LEVEL || "info";
const logDir = path.resolve(process.cwd(), "logs");
const logFile = path.join(
    logDir,
    `app-${new Date().toISOString().slice(0, 10)}.log`
);

// ensure logs directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const fileStream = pino.destination({ dest: logFile, sync: false });

const logger = pino(
    { level: logLevel },
    pino.multistream([{ stream: fileStream }])
);

export default logger;

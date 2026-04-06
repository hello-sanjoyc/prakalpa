import { Sequelize } from "sequelize";
import nodemailer from "nodemailer";
import initModels from "../../models/index.js";
import { env } from "../../config/index.js";

function cleanString(value) {
    return String(value || "").trim();
}

export default class ContactService {
    constructor(db) {
        this.sequelize =
            db?.sequelize ||
            new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
                host: env.DB_HOST,
                port: env.DB_PORT,
                dialect: env.DB_DIALECT,
                logging: false,
            });
        const models = initModels(this.sequelize);
        this.ContactInquiry = models.ContactInquiry;
    }

    async submit(payload = {}) {
        const record = await this.ContactInquiry.create({
            name: cleanString(payload.name),
            organization_name: cleanString(payload.organization_name),
            phone_number: cleanString(payload.phone_number),
            email_address: cleanString(payload.email_address),
            message: cleanString(payload.message),
        });

        await this.sendNotification(record);
        return record;
    }

    async sendNotification(record) {
        const recipient = cleanString(
            env.CONTACT_NOTIFICATION_EMAIL || env.SMTP_FROM || env.SMTP_USER
        );
        if (!recipient) {
            const err = new Error(
                "CONTACT_NOTIFICATION_EMAIL is not configured on the server."
            );
            err.statusCode = 500;
            throw err;
        }

        if (!env.SMTP_HOST || !env.SMTP_USER) {
            const err = new Error("SMTP is not configured on the server.");
            err.statusCode = 500;
            throw err;
        }

        const transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: Number(env.SMTP_PORT) || 587,
            secure: Number(env.SMTP_PORT) === 465,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        });

        const text = [
            "New contact form submission",
            `Name: ${record.name}`,
            `Organisation: ${record.organization_name}`,
            `Phone: ${record.phone_number}`,
            `Email: ${record.email_address}`,
            "",
            "Message:",
            record.message,
        ].join("\n");

        await transporter.sendMail({
            from: env.SMTP_FROM || env.SMTP_USER,
            to: recipient,
            replyTo: record.email_address,
            subject: `New contact enquiry from ${record.name}`,
            text,
        });
    }
}

import crypto from "crypto";
import { Sequelize, fn, col } from "sequelize";

export const MD5_REGEX = /^[a-f0-9]{32}$/i;

export function isMd5Hash(value) {
    return MD5_REGEX.test(String(value || "").trim());
}

export function toMd5(value) {
    const normalized = String(value || "").trim();
    if (!normalized) return "";
    if (isMd5Hash(normalized)) return normalized.toLowerCase();
    return crypto.createHash("md5").update(normalized).digest("hex");
}

export function isIdField(key) {
    return key === "id" || key.endsWith("_id");
}

export function hashIdFields(data) {
    if (Array.isArray(data)) return data.map((item) => hashIdFields(item));
    if (!data || typeof data !== "object") return data;
    if (data instanceof Date) return data;

    const source = typeof data.toJSON === "function" ? data.toJSON() : data;
    const out = {};

    for (const [key, value] of Object.entries(source)) {
        if (value === null || value === undefined) {
            out[key] = value;
            continue;
        }

        if (isIdField(key) && ["string", "number", "bigint"].includes(typeof value)) {
            out[key] = toMd5(value);
            continue;
        }

        out[key] = hashIdFields(value);
    }

    return out;
}

export async function resolveIdFromModel(model, value, label = "id") {
    if (value === null || value === undefined || value === "") return null;

    if (typeof value === "number") {
        if (!Number.isFinite(value) || value <= 0) {
            const err = new Error(`Invalid ${label}`);
            err.statusCode = 400;
            throw err;
        }
        return value;
    }

    const normalized = String(value).trim();
    if (!normalized) return null;

    if (/^\d+$/.test(normalized)) return Number(normalized);

    const hash = toMd5(normalized);
    const row = await model.findOne({
        attributes: ["id"],
        where: Sequelize.where(fn("MD5", col("id")), hash),
    });

    if (!row) {
        const err = new Error(`Invalid ${label}`);
        err.statusCode = 400;
        throw err;
    }

    return Number(row.id);
}

export async function resolveOptionalIdFromModel(model, value, label = "id") {
    if (value === null || value === undefined || value === "" || value === "null") {
        return null;
    }
    return resolveIdFromModel(model, value, label);
}

export async function resolveIdArrayFromModel(model, values = [], label = "ids") {
    if (!Array.isArray(values) || !values.length) return [];
    const resolved = await Promise.all(values.map((v) => resolveIdFromModel(model, v, label)));
    return [...new Set(resolved.filter((v) => Number(v) > 0))];
}

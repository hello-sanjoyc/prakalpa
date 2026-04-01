import { DateTime } from "luxon";

export function getCurrentFinancialYear() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth(); // 0 = Jan, 3 = Apr

    const startYear = month >= 3 ? year : year - 1;
    const endYearShort = String(startYear + 1).slice(-2);

    return `${startYear}-${endYearShort}`;
}

export function formatDateTime(date, format = "dd-LLL-yyyy") {
    let dt;

    if (date instanceof Date) {
        dt = DateTime.fromJSDate(date);
    } else if (typeof date === "string") {
        dt = DateTime.fromISO(date); // ISO strings
    } else if (typeof date === "number") {
        dt = DateTime.fromMillis(date); // timestamps
    } else if (date instanceof DateTime) {
        dt = date; // already Luxon
    } else {
        return null; // nonsense input
    }

    return dt.isValid ? dt.toFormat(format) : null;
}

export function formatMoney(amount, currency = "INR", locale = "en-IN") {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function truncateString(text, limit = 50) {
    if (typeof text !== "string") return "";

    const chars = [...text];
    if (chars.length <= limit) return text;

    return chars.slice(0, limit).join("") + "...";
}

const MIME_TYPE_MAP = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "MS Word",
    "application/msword": "MS Word",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "MS Excel",
    "application/vnd.ms-excel": "MS Excel",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "MS PowerPoint",
    "application/vnd.ms-powerpoint": "MS PowerPoint",
    "application/pdf": "PDF",
    "text/plain": "Text",
    "text/html": "HTML",
    "text/css": "CSS",
    "text/javascript": "JavaScript",
    "image/jpeg": "Image",
    "image/png": "Image",
    "image/gif": "Image",
    "image/webp": "Image",
    "image/svg+xml": "Image",
    "video/mp4": "Video",
    "video/webm": "Video",
    "video/ogg": "Video",
    "audio/mpeg": "Audio",
    "audio/wav": "Audio",
    "audio/ogg": "Audio",
    "application/zip": "ZIP",
    "application/x-rar-compressed": "RAR",
    "application/x-7z-compressed": "7Z",
};

export function getShortFileType(mimeType) {
    if (!mimeType || typeof mimeType !== "string") return "Unknown";
    if (MIME_TYPE_MAP[mimeType]) {
        return MIME_TYPE_MAP[mimeType];
    }
    if (mimeType.startsWith("image/")) return "Image";
    if (mimeType.startsWith("video/")) return "Video";
    if (mimeType.startsWith("audio/")) return "Audio";
    if (mimeType.startsWith("text/")) return "Text";
    return "File";
}

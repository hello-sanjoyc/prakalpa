import MemberService from "./member.service.js";

async function parseMultipartMember(req) {
    const fields = {};
    let avatarFile = null;

    for await (const part of req.parts()) {
        if (part.type === "file") {
            if (part.fieldname === "avatar") {
                const buffer = await part.toBuffer();
                avatarFile = { buffer, mimetype: part.mimetype };
            } else {
                await part.toBuffer();
            }
        } else {
            fields[part.fieldname] = part.value;
        }
    }

    return { fields, avatarFile };
}

function normalizeMemberPayload(fields = {}) {
    const payload = { ...fields };
    const numericFields = ["department_id", "role_id"];
    numericFields.forEach((key) => {
        if (payload[key] === "" || payload[key] === undefined) return;
        const num = Number(payload[key]);
        if (!Number.isNaN(num)) payload[key] = num;
    });
    if (payload.department_id === "") payload.department_id = 0;
    return payload;
}

function assertCreatePayload(payload) {
    const missing = [];
    if (!payload.full_name) missing.push("full_name");
    if (!payload.email) missing.push("email");
    if (!payload.phone) missing.push("phone");
    if (!payload.username) missing.push("username");
    if (
        payload.role_id === undefined ||
        payload.role_id === null ||
        payload.role_id === ""
    )
        missing.push("role_id");
    if (missing.length) {
        const err = new Error(`Missing required fields: ${missing.join(", ")}`);
        err.statusCode = 400;
        throw err;
    }
}

export async function listMembers(req, reply) {
    const service = new MemberService(req.server?.db);
    const page = req.query?.page;
    const limit = req.query?.limit;
    const sortBy = req.query?.sortBy;
    const sortOrder = req.query?.sortOrder;
    const search = req.query?.search;
    const { rows, total, page: currentPage, limit: pageLimit } =
        await service.list({ page, limit, sortBy, sortOrder, search });
    if (!rows || rows.length === 0) {
        return reply.send({
            members: [],
            message: "No member available",
            pagination: {
                page: currentPage,
                limit: pageLimit,
                total,
                totalPages: Math.ceil(total / pageLimit) || 1,
            },
        });
    }
    return reply.send({
        members: rows,
        pagination: {
            page: currentPage,
            limit: pageLimit,
            total,
            totalPages: Math.ceil(total / pageLimit) || 1,
        },
    });
}

export async function getMember(req, reply) {
    const service = new MemberService(req.server?.db);
    const member = await service.getById(req.params.id);
    return reply.send({ member });
}

export async function createMember(req, reply) {
    const service = new MemberService(req.server?.db);
    let payload = req.body || {};
    let avatarFile = null;
    if (req.isMultipart && req.isMultipart()) {
        const parsed = await parseMultipartMember(req);
        payload = normalizeMemberPayload(parsed.fields);
        avatarFile = parsed.avatarFile;
    }
    assertCreatePayload(payload);
    const member = await service.create(payload, avatarFile);
    return reply
        .code(201)
        .send({ member, message: "Member created successfully" });
}

export async function updateMember(req, reply) {
    const service = new MemberService(req.server?.db);
    let payload = req.body || {};
    let avatarFile = null;
    if (req.isMultipart && req.isMultipart()) {
        const parsed = await parseMultipartMember(req);
        payload = normalizeMemberPayload(parsed.fields);
        avatarFile = parsed.avatarFile;
    }
    const member = await service.update(req.params.id, payload, avatarFile);
    return reply.send({ member });
}

export async function deleteMember(req, reply) {
    const service = new MemberService(req.server?.db);
    await service.delete(req.params.id);
    return reply.send({ success: true });
}

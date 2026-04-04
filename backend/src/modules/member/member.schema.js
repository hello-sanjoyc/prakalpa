const memberBody = {
    type: "object",
    properties: {
        full_name: { type: "string", maxLength: 255 },
        email: { type: "string", format: "email", maxLength: 255 },
        phone: { type: "string", minLength: 10, maxLength: 15 },
        secondary_phone: { type: "string", minLength: 0, maxLength: 15 },
        whatsapp: { type: "string", minLength: 0, maxLength: 15 },
        designation: { type: "string", maxLength: 255 },
        department_id: { type: ["integer", "string"] },
        username: { type: "string", maxLength: 150 },
        role_id: { type: ["integer", "string"] },
    },
};

const idParam = {
    type: "object",
    properties: { id: { type: "string", pattern: "^[a-fA-F0-9]{32}$" } },
    required: ["id"],
};

const memberResponse = {
    type: "object",
    properties: {
        member: { type: "object", additionalProperties: true },
        message: { type: "string" },
    },
};

export const listMemberSchema = {
    querystring: {
        type: "object",
        properties: {
            page: { type: "integer", minimum: 1 },
            limit: { type: "integer", minimum: 1, maximum: 200 },
            sortBy: {
                type: "string",
                enum: ["name", "designation", "department", "role"],
            },
            sortOrder: { type: "string", enum: ["asc", "desc"] },
            search: { type: "string", minLength: 1, maxLength: 100 },
            project_member: { type: ["integer", "string"] },
        },
    },
    response: {
        200: {
            type: "object",
            properties: {
                members: {
                    type: "array",
                    items: { type: "object", additionalProperties: true },
                },
                message: { type: "string" },
                pagination: {
                    type: "object",
                    properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total: { type: "integer" },
                        totalPages: { type: "integer" },
                    },
                },
            },
        },
    },
};

export const getMemberSchema = {
    params: idParam,
    response: {
        200: memberResponse,
    },
};

export const createMemberSchema = {
    consumes: ["application/json", "multipart/form-data"],
    response: {
        201: {
            ...memberResponse,
        },
    },
};

export const updateMemberSchema = {
    params: idParam,
    consumes: ["application/json", "multipart/form-data"],
    response: { 200: memberResponse },
};

export const deleteMemberSchema = {
    params: idParam,
    response: {
        200: {
            type: "object",
            properties: { success: { type: "boolean" } },
        },
    },
};

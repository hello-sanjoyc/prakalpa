export const departmentIdParamSchema = {
    params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
    },
};

const departmentBodyProperties = {
    name: { type: "string", maxLength: 255 },
    code: { type: "string", maxLength: 64 },
    parent_id: { type: ["integer", "null"] },
};

export const listDepartmentsSchema = {
    querystring: {
        type: "object",
        properties: {
            includeDeleted: { type: "boolean", default: false },
            page: { type: "integer", minimum: 1 },
            limit: { type: "integer", minimum: 1, maximum: 200 },
            sortBy: { type: "string", enum: ["name", "code", "parent"] },
            sortOrder: { type: "string", enum: ["asc", "desc"] },
            search: { type: "string", minLength: 1, maxLength: 100 },
        },
    },
    response: {
        200: {
            type: "object",
            properties: {
                departments: {
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

export const createDepartmentSchema = {
    body: {
        type: "object",
        properties: departmentBodyProperties,
        required: ["name", "code"],
        additionalProperties: false,
    },
};

export const updateDepartmentSchema = {
    ...departmentIdParamSchema,
    body: {
        type: "object",
        properties: departmentBodyProperties,
        additionalProperties: false,
    },
};

export const optionsSchema = {
    response: {
        200: {
            type: "object",
            properties: {
                departments: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "integer" },
                            name: { type: "string" },
                            code: { type: "string" },
                        },
                    },
                },
            },
        },
    },
};

export const departmentMembersSchema = {
    ...departmentIdParamSchema,
    response: {
        200: {
            type: "object",
            properties: {
                members: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "integer" },
                            full_name: { type: "string" },
                            email: { type: "string" },
                            designation: { type: "string" },
                            avatar_path: { type: "string" },
                            phone: { type: "string" },
                        },
                    },
                },
            },
        },
    },
};

export const departmentStagesSchema = {
    ...departmentIdParamSchema,
    response: {
        200: {
            type: "object",
            properties: {
                stages: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "integer" },
                            stage_slug: { type: "string" },
                            stage_order: { type: "integer" },
                        },
                    },
                },
            },
        },
    },
};

export const departmentVendorsSchema = {
    ...departmentIdParamSchema,
    response: {
        200: {
            type: "object",
            properties: {
                vendors: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "integer" },
                            full_name: { type: "string" },
                            email: { type: "string" },
                            designation: { type: "string" },
                        },
                    },
                },
            },
        },
    },
};

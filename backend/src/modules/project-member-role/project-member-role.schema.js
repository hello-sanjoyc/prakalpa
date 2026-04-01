export const listProjectMemberRolesSchema = {
    querystring: {
        type: "object",
        properties: {
            project_id: { type: "integer", minimum: 1 },
        },
    },
    response: {
        200: {
            type: "object",
            properties: {
                roles: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "integer" },
                            name: { type: "string" },
                        },
                    },
                },
            },
        },
    },
};

export const createProjectMemberRoleSchema = {
    body: {
        type: "object",
        properties: {
            name: { type: "string", maxLength: 64 },
            project_id: { type: "integer" },
        },
        required: ["name", "project_id"],
        additionalProperties: false,
    },
    response: {
        201: {
            type: "object",
            properties: {
                role: { type: "object", additionalProperties: true },
            },
        },
    },
};

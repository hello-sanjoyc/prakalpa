export const listProjectMemberRolesSchema = {
    querystring: {
        type: "object",
        properties: {
            project_id: { type: ["integer", "string"] },
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
                            id: { type: "string" },
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
            project_id: { type: ["integer", "string"] },
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

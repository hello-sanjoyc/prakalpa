export const loginSchema = {
    body: {
        type: "object",
        properties: { email: { type: "string" }, password: { type: "string" } },
        required: ["email", "password"],
    },
};

export const memberOptionsSchema = {
    querystring: {
        type: "object",
        properties: {
            department_id: { type: "integer" },
        },
    },
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
                        },
                    },
                },
            },
        },
    },
};

export const roleOptionsSchema = {
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
                            slug: { type: "string" },
                        },
                    },
                },
            },
        },
    },
};

export const createContactInquirySchema = {
    body: {
        type: "object",
        properties: {
            name: { type: "string", minLength: 2, maxLength: 255 },
            organization_name: { type: "string", minLength: 2, maxLength: 255 },
            phone_number: {
                type: "string",
                minLength: 7,
                maxLength: 20,
                pattern: "^[0-9+()\\-\\s]{7,20}$",
            },
            email_address: { type: "string", format: "email", maxLength: 255 },
            message: { type: "string", minLength: 10, maxLength: 4000 },
        },
        required: [
            "name",
            "organization_name",
            "phone_number",
            "email_address",
            "message",
        ],
        additionalProperties: false,
    },
    response: {
        201: {
            type: "object",
            properties: {
                id: { type: "integer" },
                message: { type: "string" },
            },
        },
    },
};

export const dashboardOverviewSchema = {
    querystring: {
        type: "object",
        properties: {
            period: { type: "string", enum: ["7d", "30d", "qtr"] },
            department_id: { type: ["integer", "string"] },
        },
    },
    response: {
        200: {
            type: "object",
            properties: {
                overview: { type: "object", additionalProperties: true },
            },
        },
    },
};

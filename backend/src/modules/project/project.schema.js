export const listProjectsSchema = {
    querystring: {
        type: "object",
        properties: {
            includeDeleted: { type: "boolean", default: false },
            member: { type: "integer" },
            page: { type: "integer", minimum: 1 },
            limit: { type: "integer", minimum: 1, maximum: 200 },
            sortBy: {
                type: "string",
                enum: [
                    "title",
                    "code",
                    "department",
                    "owner",
                    "stage",
                    "budget",
                ],
            },
            sortOrder: { type: "string", enum: ["asc", "desc"] },
            search: { type: "string", minLength: 1, maxLength: 100 },
        },
    },
    response: {
        200: {
            type: "object",
            properties: {
                projects: {
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

export const projectIdParamSchema = {
    params: {
        type: "object",
        properties: {
            id: { type: "integer" },
        },
        required: ["id"],
    },
};

export const projectMilestoneIdParamSchema = {
    params: {
        type: "object",
        properties: {
            id: { type: "integer" },
            milestoneId: { type: "integer" },
        },
        required: ["id", "milestoneId"],
    },
};

export const projectTaskIdParamSchema = {
    params: {
        type: "object",
        properties: {
            id: { type: "integer" },
            taskId: { type: "integer" },
        },
        required: ["id", "taskId"],
    },
};

export const projectFinanceIdParamSchema = {
    params: {
        type: "object",
        properties: {
            id: { type: "integer" },
            financeId: { type: "integer" },
        },
        required: ["id", "financeId"],
    },
};

export const projectFileIdParamSchema = {
    params: {
        type: "object",
        properties: {
            id: { type: "integer" },
            fileId: { type: "integer" },
        },
        required: ["id", "fileId"],
    },
};

const listQuerySchema = {
    type: "object",
    properties: {
        page: { type: "integer", minimum: 1 },
        limit: { type: "integer", minimum: 1, maximum: 200 },
        sortBy: { type: "string" },
        sortOrder: { type: "string", enum: ["asc", "desc"] },
        search: { type: "string", minLength: 1, maxLength: 100 },
    },
};

const dateField = {
    anyOf: [
        { type: "string", format: "date", minLength: 1 },
        { type: "string", maxLength: 0 },
        { type: "null" },
    ],
};

const projectBodyProperties = {
    code: { type: "string", maxLength: 20 },
    title: { type: "string", maxLength: 100 },
    description: { type: "string", maxLength: 512 },
    department_id: { type: "integer" },
    owner_id: { type: "integer" },
    fin_year: { type: "string", maxLength: 9 },
    budget: { type: "number" },
    fund_allocated: { type: "number" },
    fund_consumed: { type: "number" },
    current_stage_id: { type: "number" },
    rag_status: { type: "string", enum: ["RED", "AMBER", "GREEN"] },
    rag_manual_override: { type: "boolean" },
    rag_override_reason: { type: "string" },
    start_date: dateField,
    end_date: dateField,
    revised_start_date: dateField,
    revised_end_date: dateField,
    actual_start_date: dateField,
    actual_end_date: dateField,
    version: { type: "integer" },
};

export const createProjectSchema = {
    body: {
        type: "object",
        properties: {
            ...projectBodyProperties,
            project_members: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        member_id: { type: "integer" },
                        role: { type: "string", maxLength: 64 },
                    },
                    required: ["member_id", "role"],
                },
            },
        },
        required: ["title", "department_id", "owner_id"],
    },
};

export const updateProjectSchema = {
    ...projectIdParamSchema,
    body: {
        type: "object",
        properties: {
            ...projectBodyProperties,
            project_members: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        member_id: { type: "integer" },
                        role: { type: "string", maxLength: 64 },
                    },
                    required: ["member_id", "role"],
                },
            },
            vendor_ids: {
                type: "array",
                items: { type: "integer" },
            },
        },
        additionalProperties: false,
    },
};

export const listProjectMilestonesSchema = {
    ...projectIdParamSchema,
    querystring: {
        ...listQuerySchema,
        properties: {
            ...listQuerySchema.properties,
            sortBy: { type: "string", enum: ["title", "status", "due_date"] },
        },
    },
};

export const listProjectTasksSchema = {
    ...projectIdParamSchema,
    querystring: {
        ...listQuerySchema,
        properties: {
            ...listQuerySchema.properties,
            sortBy: {
                type: "string",
                enum: ["title", "status", "due_date", "milestone"],
            },
        },
    },
};

export const listTaskDashboardSchema = {
    querystring: {
        type: "object",
        properties: {
            project_id: { type: "integer", minimum: 1 },
            member_id: { type: "integer", minimum: 1 },
            member_scope: { type: "string", enum: ["all", "me"] },
            status: {
                type: "string",
                enum: ["OPEN", "IN_PROGRESS", "BLOCKED", "DONE"],
            },
            priority: {
                type: "string",
                enum: ["LOW", "MEDIUM", "HIGH"],
            },
        },
    },
    response: {
        200: {
            type: "object",
            properties: {
                summary: {
                    type: "object",
                    properties: {
                        open: { type: "integer" },
                        in_progress: { type: "integer" },
                        blocked: { type: "integer" },
                        done: { type: "integer" },
                        total: { type: "integer" },
                    },
                },
            },
        },
    },
};

export const listProjectActionsSchema = {
    ...projectIdParamSchema,
    querystring: {
        ...listQuerySchema,
        properties: {
            ...listQuerySchema.properties,
            sortBy: {
                type: "string",
                enum: ["title", "status", "due_date", "task"],
            },
        },
    },
};

export const listProjectFilesSchema = {
    ...projectIdParamSchema,
    querystring: {
        ...listQuerySchema,
        properties: {
            ...listQuerySchema.properties,
            parent_id: { type: ["integer", "null"] },
        },
    },
};

export const listProjectMembersSchema = {
    ...projectIdParamSchema,
    querystring: {
        type: "object",
        properties: {
            exclude_member_id: { type: "integer" },
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
            },
        },
    },
};

export const listProjectFinancesSchema = {
    ...projectIdParamSchema,
    querystring: {
        ...listQuerySchema,
        properties: {
            ...listQuerySchema.properties,
            sortBy: {
                type: "string",
                enum: [
                    "entry_date",
                    "fund_allocated",
                    "fund_consumed",
                    "created_at",
                ],
            },
        },
    },
};

export const createProjectMilestoneSchema = {
    ...projectIdParamSchema,
    body: {
        type: "object",
        properties: {
            title: { type: "string", maxLength: 512 },
            due_date: { type: ["string", "null"], format: "date" },
            status: {
                type: "string",
                enum: ["PENDING", "IN_PROGRESS", "COMPLETE"],
            },
        },
        required: ["title"],
        additionalProperties: false,
    },
};

export const updateProjectMilestoneSchema = {
    ...projectMilestoneIdParamSchema,
    body: {
        type: "object",
        properties: {
            title: { type: "string", maxLength: 512 },
            due_date: dateField,
            status: {
                type: "string",
                enum: ["PENDING", "IN_PROGRESS", "COMPLETE"],
            },
        },
        additionalProperties: false,
    },
};

export const deleteProjectMilestoneSchema = {
    ...projectMilestoneIdParamSchema,
};

export const createProjectTaskSchema = {
    ...projectIdParamSchema,
    body: {
        type: "object",
        properties: {
            milestone_id: { type: "integer" },
            title: { type: "string", maxLength: 512 },
            description: { type: "string" },
            owner_id: { type: ["integer", "null"] },
            sla_hours: { type: ["integer", "null"] },
            due_date: { type: ["string", "null"], format: "date" },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
            status: {
                type: "string",
                enum: ["OPEN", "IN_PROGRESS", "BLOCKED", "DONE"],
            },
        },
        required: ["milestone_id", "title"],
        additionalProperties: false,
    },
};

export const updateProjectTaskSchema = {
    ...projectTaskIdParamSchema,
    body: {
        type: "object",
        properties: {
            milestone_id: { type: "integer" },
            title: { type: "string", maxLength: 512 },
            description: { type: "string" },
            owner_id: { type: ["integer", "null"] },
            sla_hours: { type: ["integer", "null"] },
            due_date: dateField,
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
            status: {
                type: "string",
                enum: ["OPEN", "IN_PROGRESS", "BLOCKED", "DONE"],
            },
        },
        additionalProperties: false,
    },
};

export const deleteProjectTaskSchema = {
    ...projectTaskIdParamSchema,
};

export const createProjectActionSchema = {
    ...projectIdParamSchema,
    body: {
        type: "object",
        properties: {
            task_id: { type: "integer" },
            title: { type: "string", maxLength: 512 },
            owner_id: { type: ["integer", "null"] },
            due_date: { type: ["string", "null"], format: "date" },
            status: { type: "string", enum: ["OPEN", "DONE"] },
        },
        required: ["task_id", "title"],
        additionalProperties: false,
    },
};

export const createProjectFinanceSchema = {
    ...projectIdParamSchema,
    body: {
        type: "object",
        properties: {
            entry_date: { type: "string", format: "date" },
            fund_allocated: { type: "number" },
            fund_consumed: { type: "number" },
            note: { type: "string", maxLength: 2000 },
        },
        required: ["entry_date", "fund_allocated", "fund_consumed"],
        additionalProperties: false,
    },
};

export const updateProjectFinanceSchema = {
    ...projectFinanceIdParamSchema,
    body: {
        type: "object",
        properties: {
            entry_date: dateField,
            fund_allocated: { type: "number" },
            fund_consumed: { type: "number" },
            note: { type: "string", maxLength: 2000 },
        },
        additionalProperties: false,
    },
};

export const deleteProjectFinanceSchema = {
    ...projectFinanceIdParamSchema,
};

export const createProjectFolderSchema = {
    ...projectIdParamSchema,
    body: {
        type: "object",
        properties: {
            name: { type: "string", maxLength: 512 },
            parent_id: { type: ["integer", "null"] },
            share_scope: {
                type: "string",
                enum: ["only_me", "all_members", "selected"],
            },
            shared_with: {
                type: "array",
                items: { type: "integer" },
            },
        },
        required: ["name"],
        additionalProperties: false,
    },
};

export const uploadProjectFileSchema = {
    ...projectIdParamSchema,
    consumes: ["multipart/form-data"],
};

export const deleteProjectFileSchema = {
    ...projectFileIdParamSchema,
};

export const downloadProjectFileSchema = {
    ...projectFileIdParamSchema,
};

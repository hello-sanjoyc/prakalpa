import {
    createDepartment,
    deleteDepartment,
    departmentMembers,
    departmentOptions,
    departmentStages,
    departmentVendors,
    getDepartment,
    listDepartments,
    updateDepartment,
} from "./department.controller.js";
import {
    createDepartmentSchema,
    departmentIdParamSchema,
    departmentMembersSchema,
    departmentStagesSchema,
    departmentVendorsSchema,
    listDepartmentsSchema,
    optionsSchema,
    updateDepartmentSchema,
} from "./department.schema.js";

export default async function departmentRoutes(fastify) {
    fastify.get("/", { schema: listDepartmentsSchema }, listDepartments);
    fastify.get("/options", { schema: optionsSchema }, departmentOptions);
    fastify.get("/:id", { schema: departmentIdParamSchema }, getDepartment);
    fastify.post("/", { schema: createDepartmentSchema }, createDepartment);
    fastify.put("/:id", { schema: updateDepartmentSchema }, updateDepartment);
    fastify.delete(
        "/:id",
        { schema: departmentIdParamSchema },
        deleteDepartment
    );

    // Related lookups
    fastify.get(
        "/:id/members",
        { schema: departmentMembersSchema },
        departmentMembers
    );
    fastify.get(
        "/:id/stages",
        { schema: departmentStagesSchema },
        departmentStages
    );
    fastify.get(
        "/:id/vendors",
        { schema: departmentVendorsSchema },
        departmentVendors
    );
}

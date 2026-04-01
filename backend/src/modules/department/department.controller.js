import DepartmentService from "./department.service.js";

export async function listDepartments(req, reply) {
    const service = new DepartmentService(req.server?.db);
    const page = req.query?.page;
    const limit = req.query?.limit;
    const sortBy = req.query?.sortBy;
    const sortOrder = req.query?.sortOrder;
    const search = req.query?.search;
    const includeDeleted = req.query?.includeDeleted;
    const { rows, total, page: currentPage, limit: pageLimit } =
        await service.list({
            page,
            limit,
            sortBy,
            sortOrder,
            search,
            includeDeleted,
        });
    if (!rows || rows.length === 0) {
        return reply.send({
            departments: [],
            message: "No department available",
            pagination: {
                page: currentPage,
                limit: pageLimit,
                total,
                totalPages: Math.ceil(total / pageLimit) || 1,
            },
        });
    }
    return reply.send({
        departments: rows,
        pagination: {
            page: currentPage,
            limit: pageLimit,
            total,
            totalPages: Math.ceil(total / pageLimit) || 1,
        },
    });
}

export async function getDepartment(req, reply) {
    const service = new DepartmentService(req.server?.db);
    const department = await service.getById(req.params.id);
    return reply.send({ department });
}

export async function createDepartment(req, reply) {
    const service = new DepartmentService(req.server?.db);
    const department = await service.create(req.body);
    return reply.code(201).send({ department });
}

export async function updateDepartment(req, reply) {
    const service = new DepartmentService(req.server?.db);
    const department = await service.update(req.params.id, req.body);
    return reply.send({ department });
}

export async function deleteDepartment(req, reply) {
    const service = new DepartmentService(req.server?.db);
    const result = await service.softDelete(req.params.id);
    return reply.send(result);
}

export async function departmentOptions(req, reply) {
    const service = new DepartmentService(req.server?.db);
    const departments = await service.options();
    return reply.send({ departments });
}

export async function departmentMembers(req, reply) {
    const service = new DepartmentService(req.server?.db);
    const members = await service.members(req.params.id);
    return reply.send({ members });
}

export async function departmentStages(req, reply) {
    const service = new DepartmentService(req.server?.db);
    const stages = await service.stages(req.params.id);
    return reply.send({ stages });
}

export async function departmentVendors(req, reply) {
    const service = new DepartmentService(req.server?.db);
    const vendors = await service.vendors(req.params.id);
    return reply.send({ vendors });
}

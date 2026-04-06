import ContactService from "./contact.service.js";

export async function createContactInquiry(req, reply) {
    const service = new ContactService(req.server?.db);
    const record = await service.submit(req.body || {});
    return reply.code(201).send({
        id: Number(record.id),
        message: "Contact form submitted successfully.",
    });
}

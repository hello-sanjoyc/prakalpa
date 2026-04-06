import { createContactInquiry } from "./contact.controller.js";
import { createContactInquirySchema } from "./contact.schema.js";

export default async function contactRoutes(fastify) {
    fastify.post("/", { schema: createContactInquirySchema }, createContactInquiry);
}

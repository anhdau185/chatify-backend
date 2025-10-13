import { loginController } from "@controllers/authControllers";
import type { FastifyInstance } from "fastify";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/login", loginController);
}

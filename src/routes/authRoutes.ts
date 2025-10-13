import type { FastifyInstance } from "fastify";
import { loginController } from "../controllers/authControllers.js";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{
    Body: { username: string; password: string };
  }>("/auth/login", loginController);
}

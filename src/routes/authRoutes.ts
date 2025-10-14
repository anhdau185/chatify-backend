import type { FastifyInstance } from "fastify";
import {
  authenticateController,
  loginController,
} from "../controllers/authControllers.js";

interface IBody {
  username: string;
  password: string;
}

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: IBody }>("/auth/login", loginController);
  fastify.post("/auth/authenticate", authenticateController);
}

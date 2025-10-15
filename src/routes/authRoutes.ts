import type { FastifyInstance } from "fastify";

import {
  authenticateController,
  loginController,
  logoutController,
} from "../controllers/authControllers.js";
import { IBody, IReply } from "../types/auth.js";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{
    Body: IBody;
    Reply: IReply;
  }>("/auth/login", loginController);

  fastify.get<{
    Reply: IReply;
  }>("/auth/me", authenticateController);

  fastify.get("/auth/logout", logoutController);
}

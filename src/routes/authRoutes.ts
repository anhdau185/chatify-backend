import type { FastifyInstance } from "fastify";

import {
  authenticateController,
  loginController,
  logoutController,
} from "../controllers/authControllers.js";
import type {
  IBodyLogin,
  IReplyAuth,
  IReplyLogin,
  IReplyLogout,
} from "../types/auth.js";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{
    Body: IBodyLogin;
    Reply: IReplyLogin;
  }>("/auth/login", loginController);

  fastify.get<{
    Reply: IReplyAuth;
  }>("/auth/me", authenticateController);

  fastify.get<{
    Reply: IReplyLogout;
  }>("/auth/logout", logoutController);
}

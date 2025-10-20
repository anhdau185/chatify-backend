import type { FastifyInstance } from "fastify";

import {
  authenticateController,
  loginController,
  logoutController,
} from "./auth.controller.js";
import type {
  IBodyLogin,
  IReplyAuth,
  IReplyLogin,
  IReplyLogout,
} from "./auth.type.js";

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

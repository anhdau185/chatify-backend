import type { FastifyInstance } from "fastify";

import { COOKIE_NAME } from "../shared/constants.js";
import * as messagingService from "./messaging.service.js";

export default async function messagingRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/ws",
    {
      websocket: true,
      preHandler: (request, reply, done) => {
        const jsonReply = reply.header("Content-Type", "application/json");

        try {
          // Authenticate the user before establishing WebSocket connection
          const token = request.cookies[COOKIE_NAME];
          if (!token) {
            return jsonReply
              .code(401)
              .send({ error: "Authentication unsuccessful" });
          }

          if (!process.env.JWT_SECRET) {
            throw new Error("JWT secret not correctly configured");
          }

          try {
            request.server.jwt.verify(token);
          } catch {
            return jsonReply
              .code(401)
              .send({ error: "Authentication unsuccessful" });
          }

          // User is authenticated, allow the connection to proceed
          done();
        } catch (err) {
          console.error(
            "Unexpected error during WebSocket upgrade process",
            err
          );

          return jsonReply
            .code(500)
            .send({ error: "Something went wrong on our end :(" });
        }
      },
    },
    (socket) => {
      messagingService.handleIncomingClient(socket);
    }
  );
}

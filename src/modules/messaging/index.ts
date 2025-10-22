import type { FastifyInstance } from "fastify";

import {
  wsConnectionHandler,
  wsConnectionPreHandler,
} from "./messaging.controller.js";

export default async function messagingRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/ws",
    {
      websocket: true,
      preHandler: wsConnectionPreHandler, // verify user here before upgrading to WebSocket
    },
    wsConnectionHandler
  );
}

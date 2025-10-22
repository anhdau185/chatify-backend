import type { FastifyInstance } from "fastify";

import {
  wsConnectionHandler,
  wsConnectionPreHandler,
} from "./messaging.controller.js";

export default async function messagingRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/messaging/ws",
    {
      websocket: true,
      preHandler: wsConnectionPreHandler, // verify user here before upgrading to websocket
    },
    wsConnectionHandler // user is authenticated, proceed to upgrade connection to websocket
  );
}

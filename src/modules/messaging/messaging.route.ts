import websocket from "@fastify/websocket";
import type { FastifyInstance } from "fastify";

import {
  getChatRoomsController,
  wsConnectionHandler,
  wsConnectionPreHandler,
} from "./messaging.controller.js";

export default async function messagingRoutes(fastify: FastifyInstance) {
  await fastify.register(websocket);

  fastify.get(
    "/messaging/ws",
    {
      websocket: true,
      preHandler: wsConnectionPreHandler, // verify user here before upgrading to websocket
    },
    wsConnectionHandler // user is authenticated, proceed to upgrade connection to websocket
  );

  fastify.get("/messaging/rooms", getChatRoomsController);
}

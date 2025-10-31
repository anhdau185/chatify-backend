import type { WebsocketHandler } from "@fastify/websocket";
import type { RouteHandler } from "fastify";
import type { preHandlerMetaHookHandler as PreHandlerController } from "fastify/types/hooks.js";

import { COOKIE_NAME } from "../shared/constants.js";
import * as messagingService from "./messaging.service.js";

export const wsConnectionPreHandler: PreHandlerController = (
  request,
  reply,
  done
) => {
  const fastify = request.server;
  const jsonReply = reply.header("Content-Type", "application/json");

  try {
    // Authenticate the user before establishing WebSocket connection
    const token = request.cookies[COOKIE_NAME];
    if (!token) {
      return jsonReply.code(401).send({ error: "Authentication unsuccessful" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret not correctly configured");
    }

    try {
      fastify.jwt.verify(token);
    } catch {
      // log the user out when an expired token is detected
      jsonReply.clearCookie(COOKIE_NAME, { path: "/" });

      return jsonReply.code(401).send({ error: "Authentication unsuccessful" });
    }

    // User is authenticated, allow the connection to proceed
    done();
  } catch (err) {
    console.error("Unexpected error during WebSocket upgrade process", err);

    return jsonReply
      .code(500)
      .send({ error: "Something went wrong on our end :(" });
  }
};

export const wsConnectionHandler: WebsocketHandler = (socket, request) => {
  messagingService.handleIncomingClient(socket);
};

export const getChatRoomsController: RouteHandler<{
  Querystring: { userId: string };
}> = async (request, reply) => {
  const jsonReply = reply.header("Content-Type", "application/json");

  try {
    if (!request.query.userId) {
      return jsonReply
        .code(400)
        .send({ error: "userId is required as a query parameter" });
    }

    const userId = parseInt(request.query.userId);

    if (!isFinite(userId) || userId <= 0) {
      return jsonReply
        .code(400)
        .send({ error: "userId must be a valid positive integer" });
    }

    const rooms = await messagingService.getChatRoomsByUserId(userId);

    return jsonReply.code(200).send({
      success: true,
      data: rooms,
    });
  } catch (err) {
    console.error("Unexpected error during logout process", err);

    return jsonReply
      .code(500)
      .send({ error: "Something went wrong on our end :(" });
  }
};

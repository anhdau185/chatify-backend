import type { WebSocket } from "@fastify/websocket";
import type { preHandlerMetaHookHandler } from "fastify/types/hooks.js";

import { COOKIE_NAME } from "../shared/constants.js";
import * as messagingService from "./messaging.service.js";

export const wsConnectionPreHandler: preHandlerMetaHookHandler = (
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

export const wsConnectionHandler = (socket: WebSocket) => {
  messagingService.handleIncomingClient(socket);
};

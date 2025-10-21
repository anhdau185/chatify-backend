import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import dotenv from "dotenv";
import fastify from "fastify";

import { authRoutes } from "./modules/auth/index.js";
import messagingRoutes from "./modules/messaging/index.js";

dotenv.config({ path: "./.env" });

const server = fastify({ logger: true });

// register plugins and routes
server
  .register(cors, {
    origin: ["http://localhost:3000"], // whitelist trusted origins here
    credentials: true,
  })
  .register(cookie)
  .register(websocket)
  .register(authRoutes)
  .register(messagingRoutes);

server.get("/", async (request, reply) => {
  reply.send("pong!\n");
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});

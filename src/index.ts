import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import dotenv from "dotenv";
import fastify from "fastify";

import { authRoutes } from "./modules/auth/index.js";
import { mediaRoutes } from "./modules/media/index.js";
import { messagingRoutes } from "./modules/messaging/index.js";

dotenv.config({ path: "./.env" });

const server = fastify({ logger: true });

// register global plugins
server
  .register(cors, {
    origin: ["http://localhost:3000"], // whitelist trusted origins here
    credentials: true,
  })
  .register(cookie)
  .register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "",
  });

// register routes
server.register(authRoutes).register(messagingRoutes).register(mediaRoutes);

// health check route
server.get("/", async (_, reply) => {
  reply.send("pong!\n");
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});

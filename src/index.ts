import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import fastify from "fastify";

import { authRoutes } from "./modules/auth/index.js";

dotenv.config({ path: "./.env" });

// test server health
const server = fastify({ logger: true });

// register plugins and routes
server
  .register(cors, {
    origin: ["http://localhost:3000"], // whitelist trusted origins here
    credentials: true,
  })
  .register(cookie)
  .register(authRoutes);

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

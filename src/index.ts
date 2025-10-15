// import "module-alias/register.js";

import cors from "@fastify/cors";
import dotenv from "dotenv";
import fastify from "fastify";

import authRoutes from "./routes/authRoutes.js";

dotenv.config({ path: "./.env" });

// test server health
const server = fastify({ logger: true });

// register routes
server
  .register(cors, {
    origin: ["http://localhost:3000", "https://api.chatify.com"], // frontend app's development/production server
    credentials: true,
  })
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

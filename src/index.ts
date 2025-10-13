import fastify from "fastify";
import "module-alias/register.js";

const server = fastify({ logger: true });

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

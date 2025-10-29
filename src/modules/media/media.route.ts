import fastifyMultipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";

import {
  uploadMultipleController,
  uploadSingleController,
} from "./media.controller.js";

export default async function mediaRoutes(fastify: FastifyInstance) {
  await fastify.register(fastifyMultipart, {
    limits: {
      files: 5, // max number of files per request
      fileSize: 1 * 1024 * 1024, // max 1MB per file
    },
  });

  fastify.post("/media/upload/single", uploadSingleController);

  fastify.post("/media/upload/multiple", uploadMultipleController);
}

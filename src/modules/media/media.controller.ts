import crypto from "crypto";
import type { RouteHandler } from "fastify";
import path from "path";

import { drainStream } from "../shared/lib/utils.js";
import * as mediaService from "./media.service.js";

const EXAMPLE_PHOTO_URLS = [
  "https://live.staticflickr.com/421/19244076123_67af33bb87_b.jpg",
  "https://live.staticflickr.com/8259/9024877289_e335ae8431_b.jpg",
  "https://live.staticflickr.com/3835/14680951178_c8375f7d0c_b.jpg",
  "https://live.staticflickr.com/7441/10538965076_3a9379898e_b.jpg",
  "https://live.staticflickr.com/65535/51362322279_fe266e2d8b_b.jpg",
];

export const uploadSingleController: RouteHandler = async (request, reply) => {
  const jsonReply = reply.header("Content-Type", "application/json");
  const data = await request.file();

  if (!data) {
    return jsonReply.code(400).send({ error: "No file uploaded" });
  }

  // Validate MIME type (allow only "image/*")
  if (!data.mimetype.startsWith("image/")) {
    data.file.resume(); // drain the stream
    return jsonReply.code(415).send({
      error: `File must be an image but received ${data.mimetype}`,
    });
  }

  const validation = mediaService.validateFile(data.filename);
  if (!validation.valid) {
    data.file.resume(); // drain the stream
    return jsonReply.code(400).send({
      error: "File validation failed",
      details: validation.errors,
    });
  }

  // TODO: In real implementation, save the file stream to storage instead of draining
  data.file.resume();

  // Generate a unique filename
  const fileId = crypto.randomUUID();
  const fileExt = path.extname(data.filename);
  const uniqueFilename = `${fileId}${fileExt}`;

  try {
    // Using mock photo URL
    // TODO: Integrate with real storage service
    const fileUrl =
      EXAMPLE_PHOTO_URLS[
        Math.floor(Math.random() * EXAMPLE_PHOTO_URLS.length)
      ] || EXAMPLE_PHOTO_URLS[0];

    return jsonReply.code(201).send({
      success: true,
      data: {
        fileUrl,
        originalFilename: data.filename,
        storedFilename: uniqueFilename,
        mimeType: data.mimetype,
        encoding: data.encoding,
      },
    });
  } catch (err) {
    console.error("Error saving file to storage", err);
    return jsonReply.code(500).send({ error: "Failed to save file" });
  }
};

export const uploadMultipleController: RouteHandler = async (
  request,
  reply
) => {
  const jsonReply = reply.header("Content-Type", "application/json");
  const parts = request.parts();
  const results = [];
  const maxFiles = 5;
  let fileCount = 0;

  for await (const part of parts) {
    if (part.type !== "file" || !part.file) {
      continue;
    }

    fileCount++;

    // Check file limit
    if (fileCount > maxFiles) {
      await drainStream(part.file);
      return jsonReply.code(400).send({
        error: `Too many files. Maximum ${maxFiles} files allowed.`,
      });
    }

    // Validate MIME type (allow only "image/*")
    if (!part.mimetype.startsWith("image/")) {
      await drainStream(part.file);
      results.push({
        success: false,
        data: {
          filename: part.filename,
          errors: [`File must be an image but received ${part.mimetype}`],
        },
      });
      continue;
    }

    // Validate each file
    const validation = mediaService.validateFile(part.filename);
    if (!validation.valid) {
      await drainStream(part.file);
      results.push({
        success: false,
        data: {
          filename: part.filename,
          errors: validation.errors,
        },
      });
      continue;
    }

    // TODO: In real implementation, save the file stream to storage instead of draining
    await drainStream(part.file);

    // Save valid files
    const fileId = crypto.randomUUID();
    const fileExt = path.extname(part.filename);
    const uniqueFilename = `${fileId}${fileExt}`;

    try {
      // Using mock photo URL
      // TODO: Integrate with real storage service
      const fileUrl =
        EXAMPLE_PHOTO_URLS[
          Math.floor(Math.random() * EXAMPLE_PHOTO_URLS.length)
        ] || EXAMPLE_PHOTO_URLS[0];

      results.push({
        success: true,
        data: {
          fileUrl,
          originalFilename: part.filename,
          storedFilename: uniqueFilename,
          mimeType: part.mimetype,
          encoding: part.encoding,
        },
      });
    } catch (err) {
      console.error(err);
      results.push({
        success: false,
        data: {
          filename: part.filename,
          errors: ["Failed to save file"],
        },
      });
    }
  }

  if (fileCount === 0) {
    return jsonReply.code(400).send({ error: "No files uploaded" });
  }

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const resData = {
    totalFiles: results.length,
    successful: successful.length,
    failed: failed.length,
    results: results,
    uploadTime: Date.now(),
  };

  if (failed.length > 0) {
    return jsonReply.code(207).send(resData);
  }
  return jsonReply.code(201).send(resData);
};

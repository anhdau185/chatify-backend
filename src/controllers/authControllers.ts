import type { RouteHandler } from "fastify";

import * as authService from "../services/authService.js";
import { IBody, IReply } from "../types/auth.js";

const COOKIE_NAME = "chatify_access_jwt";
const COOKIE_MAX_AGE_SECS = 24 * 60 * 60; // 24 hours

export const loginController: RouteHandler<{
  Body: IBody;
  Reply: IReply;
}> = async (req, fReply) => {
  const reply = fReply.header("Content-Type", "application/json");

  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return reply
        .code(400)
        .send({ error: "Username and password are required" });
    }

    const user = await authService.findUserByUsername(username);
    if (!user) {
      // avoid being too specific for security reasons
      return reply.code(401).send({ error: "Invalid username or password" });
    }

    const isPasswordValid = await authService.comparePasswords(
      password,
      user.hashedPassword
    );
    if (!isPasswordValid) {
      // avoid being too specific for security reasons
      return reply.code(401).send({ error: "Invalid username or password" });
    }

    const token = authService.issueToken(user.id, user.username);
    if (!token) {
      throw new Error("Error issuing token");
    }

    reply.setCookie(COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE_SECS,
    });

    return reply.code(200).send({
      success: true,
      access: token,
    });
  } catch (err) {
    console.error("Unexpected error during login process", err);

    return reply
      .code(500)
      .send({ error: "Something went wrong on our end :(" });
  }
};

export const authenticateController: RouteHandler<{
  Reply: IReply;
}> = async (req, fReply) => {
  const token = req.cookies[COOKIE_NAME];
  const reply = fReply.header("Content-Type", "application/json");

  if (!token) {
    return reply.code(401).send({ error: "Authentication unsuccessful" });
  }

  const decoded = authService.verifyToken(token);
  if (!decoded) {
    return reply.code(401).send({ error: "Authentication unsuccessful" });
  }

  return reply.code(200).send({
    success: true,
    authenticatedUser: decoded,
  });
};

export const logoutController: RouteHandler<{
  Reply: IReply;
}> = async (_, fReply) => {
  const reply = fReply.header("Content-Type", "application/json");
  reply.clearCookie(COOKIE_NAME, { path: "/" });
  reply.code(200).send({ success: true });
};

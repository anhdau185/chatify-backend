import type { RouteHandler } from "fastify";

import { COOKIE_NAME } from "../shared/constants.js";
import type { PublicUser } from "../user/index.js";
import * as authService from "./auth.service.js";
import type {
  IBodyLogin,
  IReplyAuth,
  IReplyLogin,
  IReplyLogout,
} from "./auth.type.js";

const COOKIE_MAX_AGE_SECS = 24 * 60 * 60; // 24 hours

const MIN_USERNAME_LENGTH = 6;
const MIN_PASSWORD_LENGTH = 6;

export const loginController: RouteHandler<{
  Body: IBodyLogin;
  Reply: IReplyLogin;
}> = async (request, reply) => {
  const fastify = request.server;
  const jsonReply = reply.header("Content-Type", "application/json");

  try {
    const { username, password } = request.body;
    if (!username || !password) {
      return jsonReply
        .code(400)
        .send({ error: "Username and password are required" });
    }

    // check credentials length
    const usernameTooShort = username.length < MIN_USERNAME_LENGTH;
    if (usernameTooShort) {
      return jsonReply.code(400).send({
        error: `Username must be at least ${MIN_USERNAME_LENGTH} characters long`,
      });
    }

    const passwordTooShort = password.length < MIN_PASSWORD_LENGTH;
    if (passwordTooShort) {
      return jsonReply.code(400).send({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      });
    }

    // try querying the user
    const user = await authService.findUserByUsername(username);
    if (!user) {
      // avoid being too specific about the invalid credential for security reasons
      return jsonReply
        .code(401)
        .send({ error: "Invalid username or password" });
    }

    const isPasswordValid = await authService.comparePasswords(
      password,
      user.hashedPassword
    );
    if (!isPasswordValid) {
      // avoid being too specific for security reasons
      return jsonReply
        .code(401)
        .send({ error: "Invalid username or password" });
    }

    const authenticatedUser: PublicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
    };

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret not correctly configured");
    }

    const token = fastify.jwt.sign(authenticatedUser, {
      expiresIn: "24h",
    });

    jsonReply.setCookie(COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // TODO: use local HTTPS development servers
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE_SECS,
    });

    return jsonReply.code(200).send({
      success: true,
      access: token,
      authenticatedUser,
    });
  } catch (err) {
    console.error("Unexpected error during login process", err);

    return jsonReply
      .code(500)
      .send({ error: "Something went wrong on our end :(" });
  }
};

export const authenticateController: RouteHandler<{
  Reply: IReplyAuth;
}> = async (request, reply) => {
  const fastify = request.server;
  const jsonReply = reply.header("Content-Type", "application/json");

  try {
    const token = request.cookies[COOKIE_NAME];
    if (!token) {
      return jsonReply.code(401).send({ error: "Authentication unsuccessful" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret not correctly configured");
    }

    let authenticatedUser: PublicUser;
    try {
      authenticatedUser = fastify.jwt.verify(token);
    } catch {
      // log the user out when an expired token is detected
      jsonReply.clearCookie(COOKIE_NAME, { path: "/" });

      return jsonReply.code(401).send({ error: "Authentication unsuccessful" });
    }

    return jsonReply.code(200).send({
      success: true,
      access: token,
      authenticatedUser,
    });
  } catch (err) {
    console.error("Unexpected error during authentication process", err);

    return jsonReply
      .code(500)
      .send({ error: "Something went wrong on our end :(" });
  }
};

export const logoutController: RouteHandler<{
  Reply: IReplyLogout;
}> = async (request, reply) => {
  const jsonReply = reply.header("Content-Type", "application/json");

  try {
    jsonReply.clearCookie(COOKIE_NAME, { path: "/" });

    return jsonReply.code(200).send({ success: true });
  } catch (err) {
    console.error("Unexpected error during logout process", err);

    return jsonReply
      .code(500)
      .send({ error: "Something went wrong on our end :(" });
  }
};

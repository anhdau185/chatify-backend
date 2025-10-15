import type { RouteHandler } from "fastify";
import type { JwtPayload } from "jsonwebtoken";
import * as authService from "../services/authService.js";

interface IBody {
  username: string;
  password: string;
}

interface IReply {
  200: {
    success: boolean;
    access?: string;
    authenticatedUser?: string | JwtPayload;
  };
  "4xx": { error: string };
  500: { error: string };
}

export const loginController: RouteHandler<{
  Body: IBody;
  Reply: IReply;
}> = async (req, fReply) => {
  const reply = fReply.header("Content-Type", "application/json");

  try {
    const { username: rawUsername, password } = req.body;
    const username = rawUsername.trim();

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
  const reply = fReply.header("Content-Type", "application/json");
  const bearerToken = req.headers.authorization;

  if (!bearerToken) {
    return reply.code(401).send({ error: "Authentication unsuccessful" });
  }

  const token = bearerToken.split(" ")[1];
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

import type { RouteHandler } from "fastify";
import * as authService from "../services/authService.js";

interface IBody {
  username: string;
  password: string;
}

interface IReply {
  200: { success: boolean };
  "4xx": { error: string };
  500: { error: string };
}

export const loginController: RouteHandler<{
  Body: IBody;
  Reply: IReply;
}> = async (request, fReply) => {
  const reply = fReply.header("Content-Type", "application/json");

  try {
    const { username: rawUsername, password } = request.body;
    const username = rawUsername.trim();

    if (!username || !password) {
      return reply.code(400).send({ error: "Email and password are required" });
    }

    const user = await authService.findUserByUsername(username);
    if (!user) {
      // avoid being too specific for security reasons
      return reply.code(401).send({ error: "Invalid email or password" });
    }

    const isPasswordValid = await authService.comparePasswords(
      password,
      user.hashedPassword
    );
    if (!isPasswordValid) {
      // avoid being too specific for security reasons
      return reply.code(401).send({ error: "Invalid email or password" });
    }

    return reply.code(200).send({ success: true });
  } catch (err) {
    console.error("Unexpected error during login process", err);

    return reply
      .code(500)
      .send({ error: "An error occurred during login. Please try again." });
  }
};

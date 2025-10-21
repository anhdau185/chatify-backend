import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import type { PublicUser } from "../user/index.js";
import { MOCK_USER_1 } from "../user/index.js";

export async function findUserByUsername(username: string) {
  try {
    // TODO: implement actual "find by username" logic
    // by querying from db or reading file from disk
    if (username !== MOCK_USER_1.username) {
      throw new Error("Invalid username");
    }

    return MOCK_USER_1;
  } catch (err) {
    console.error("Error finding user", err);
    return null;
  }
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
) {
  try {
    return bcrypt.compare(password, hashedPassword);
  } catch (err) {
    console.error("Error comparing passwords", err);
    return false;
  }
}

export function issueToken(user: PublicUser) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret not correctly configured");
    }

    const payload = { ...user };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    return token;
  } catch (err) {
    console.error("Error issuing token", err);
    return null;
  }
}

export function verifyToken(token: string) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret not correctly configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as PublicUser;
    return decoded;
  } catch (err) {
    console.error("Error verifying token", err);
    return null;
  }
}

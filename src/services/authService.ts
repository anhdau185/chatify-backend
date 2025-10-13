import bcrypt from "bcrypt";
import { MOCK_USER } from "../mocks/index.js";

export async function findUserByUsername(username: string) {
  try {
    // TODO: implement actual "find by username" logic by querying from db or reading file from disk
    if (username !== MOCK_USER.username) {
      throw new Error("Invalid username");
    }

    return MOCK_USER;
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

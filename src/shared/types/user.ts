import type { JwtPayload } from "jsonwebtoken";

interface User {
  id: number;
  name: string;
  email: string | null;
  username: string;
  hashedPassword: string;
}

interface PublicUser extends Omit<User, "hashedPassword">, JwtPayload {}

export type { PublicUser, User };

import type { PublicUser } from "../models/user.js";

interface IBody {
  username: string;
  password: string;
}

interface IReply {
  200: {
    success: boolean;
    access: string;
    authenticatedUser: PublicUser;
  };
  "4xx": { error: string };
  500: { error: string };
}

interface IReplyLogout extends Pick<IReply, "4xx" | 500> {
  200: { success: boolean };
}

export type { IBody, IReply, IReplyLogout };

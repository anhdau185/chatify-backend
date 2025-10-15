import { JwtPayload } from "jsonwebtoken";

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

export { IBody, IReply };

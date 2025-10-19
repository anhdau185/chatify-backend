import type { PublicUser } from "./user.js";

interface IError {
  error: string;
}

interface IBodyLogin {
  username: string;
  password: string;
}

interface IReplyLogin {
  200: {
    success: boolean;
    access: string;
    authenticatedUser: PublicUser;
  };
  "4xx": IError;
  500: IError;
}

interface IReplyAuth extends IReplyLogin {}

interface IReplyLogout {
  200: { success: boolean };
  "4xx": IError;
  500: IError;
}

export type { IBodyLogin, IReplyAuth, IReplyLogin, IReplyLogout };

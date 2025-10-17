interface User {
  id: number;
  name: string;
  email: string | null;
  username: string;
  hashedPassword: string;
}

type PublicUser = Omit<User, "hashedPassword">;

export type { PublicUser, User };

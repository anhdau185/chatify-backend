import { omit } from "lodash-es";

import type { PublicUser, User } from "./user.type.js";

function makePublicUser(user: User): PublicUser {
  return omit(user, ["hashedPassword"]);
}

const MOCK_USER_1: User = {
  id: 1,
  name: "Alex Rivera",
  email: null,
  username: "chatify1",
  hashedPassword:
    "$2a$12$HLb5/HZsfcYRV1HW371d.uwTG1q84fu5w4KteamGYqLieLfcZs5O6", // hashed string for "abc123xyz"
};

const MOCK_USER_2: User = {
  id: 2,
  name: "Jordan Lee",
  email: null,
  username: "chatify2",
  hashedPassword:
    "$2a$12$HLb5/HZsfcYRV1HW371d.uwTG1q84fu5w4KteamGYqLieLfcZs5O6", // hashed string for "abc123xyz"
};

const MOCK_USER_3: User = {
  id: 3,
  name: "Morgan Smith",
  email: null,
  username: "chatify3",
  hashedPassword:
    "$2a$12$HLb5/HZsfcYRV1HW371d.uwTG1q84fu5w4KteamGYqLieLfcZs5O6", // hashed string for "abc123xyz"
};

const ALL_MOCK_USERS: User[] = [MOCK_USER_1, MOCK_USER_2, MOCK_USER_3];

export {
  ALL_MOCK_USERS,
  makePublicUser,
  MOCK_USER_1,
  MOCK_USER_2,
  MOCK_USER_3,
};

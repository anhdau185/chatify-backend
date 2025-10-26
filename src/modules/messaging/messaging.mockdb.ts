import {
  MOCK_USER_1,
  MOCK_USER_2,
  MOCK_USER_3,
  makePublicUser,
} from "../user/index.js";
import type { ChatRoom } from "./messaging.type.js";

const MOCK_CHAT_ROOM_1: ChatRoom = {
  id: "8897c46b-7fd8-45a4-a12b-8dabf64e4427",
  members: [makePublicUser(MOCK_USER_1), makePublicUser(MOCK_USER_2)],
  isGroup: false, // 1:1 DM conversation
  lastMsgAt: 0,
};

const MOCK_CHAT_ROOM_2: ChatRoom = {
  id: "40194dfa-5e2f-450e-af6e-07404d48da98",
  members: [makePublicUser(MOCK_USER_1), makePublicUser(MOCK_USER_3)],
  isGroup: false, // 1:1 DM conversation
  lastMsgAt: 0,
};

const MOCK_CHAT_ROOM_3: ChatRoom = {
  id: "f64b6e1a-338c-46dd-90aa-ceaedf780fad",
  members: [makePublicUser(MOCK_USER_2), makePublicUser(MOCK_USER_3)],
  isGroup: false, // 1:1 DM conversation
  lastMsgAt: 0,
};

const MOCK_GROUP_CHAT_ROOM: ChatRoom = {
  id: "5d64a654-8dde-47f2-84da-17733ea0c6ad",
  name: "Study Group",
  members: [
    makePublicUser(MOCK_USER_1),
    makePublicUser(MOCK_USER_2),
    makePublicUser(MOCK_USER_3),
  ],
  isGroup: true, // Group chat
  lastMsgAt: 0,
};

const ALL_MOCK_CHAT_ROOMS: ChatRoom[] = [
  MOCK_CHAT_ROOM_1,
  MOCK_CHAT_ROOM_2,
  MOCK_CHAT_ROOM_3,
  MOCK_GROUP_CHAT_ROOM,
];

export {
  ALL_MOCK_CHAT_ROOMS,
  MOCK_CHAT_ROOM_1,
  MOCK_CHAT_ROOM_2,
  MOCK_CHAT_ROOM_3,
  MOCK_GROUP_CHAT_ROOM,
};

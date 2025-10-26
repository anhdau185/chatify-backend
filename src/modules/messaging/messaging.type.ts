import type { PublicUser } from "../user/index.js";

interface ChatRoomsResponse {
  success: boolean;
  data: ChatRoom[];
}

interface ChatRoom {
  id: string;
  name?: string; // for group chats
  members: PublicUser[];
  isGroup: boolean;
  lastMsgAt: number; // timestamp of last message, 0 if no messages yet
  lastMsg?: ChatMessage; // preview of last message, unavailable if lastMsgAt is 0
}

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: number;
  senderName: string;
  content?: string;
  imageUrl?: string;
  reactions: Record<string, Array<{ userId: number; name: string }>>; // emoji -> user[]
  status: "sending" | "sent" | "failed"; // add 'read' later
  createdAt: number;
}

interface WsPayloadJoin {
  roomIds: string[];
  senderId: number;
}

type WsPayloadChat = ChatMessage;

interface WsMessageJoin {
  type: "join";
  payload: WsPayloadJoin;
}

interface WsMessageChat {
  type: "chat";
  payload: WsPayloadChat;
}

interface WsMessageReact {
  type: "react";
  payload: WsPayloadChat;
}

type WsMessage = WsMessageJoin | WsMessageChat;

export type {
  ChatMessage,
  ChatRoom,
  ChatRoomsResponse,
  WsMessage,
  WsMessageChat,
  WsMessageJoin,
  WsMessageReact,
  WsPayloadChat,
  WsPayloadJoin,
};

import type { WebSocket } from "@fastify/websocket";

import { ALL_MOCK_CHAT_ROOMS } from "./messaging.mockdb.js";
import type {
  ChatRoom,
  WsMessage,
  WsMessageChat,
  WsMessageUpdateStatus,
} from "./messaging.type.js";

type UserID = number;
type RoomID = string;
type MessageID = string;
type ChatClients = Map<UserID, WebSocket>;

const roomsMap = new Map<RoomID, Set<WebSocket>>();
const deliveredMsgIds = new Set<MessageID>();
const readMsgIds = new Set<MessageID>();

export function handleIncomingClient(socket: WebSocket) {
  socket.on("message", (raw) => {
    const msg: WsMessage = JSON.parse(raw.toString());

    switch (msg.type) {
      case "join": {
        msg.payload.roomIds.forEach((roomId) => {
          console.log(
            `received a request to join room ${roomId} from user ${msg.payload.senderId}`
          );

          if (!roomsMap.has(roomId)) {
            roomsMap.set(roomId, new Set());
          }

          const roomToJoin = roomsMap.get(roomId);

          if (!roomToJoin) {
            return;
          }

          roomToJoin.add(socket);
          console.log(
            `user ${msg.payload.senderId} has been added to room ${roomId}`
          );
        });
        break;
      }

      case "chat": {
        console.log(
          `received message "${msg.payload.content}" (uuid: ${msg.payload.id}) from sender ${msg.payload.senderId}`
        );

        const roomToBroadcast = roomsMap.get(msg.payload.roomId);

        if (!roomToBroadcast) {
          break;
        }

        // Update status to 'sent'
        const timestamp =
          msg.payload.status === "retrying"
            ? Date.now()
            : msg.payload.createdAt;

        const updatedMsg: WsMessageChat = {
          ...msg,
          payload: {
            ...msg.payload,
            createdAt: timestamp,
            status: "sent",
          },
        };

        const sentAckMsg: WsMessageUpdateStatus = {
          type: "update-status",
          payload: {
            id: msg.payload.id,
            roomId: msg.payload.roomId,
            senderId: msg.payload.senderId,
            createdAt: timestamp,
            status:
              msg.payload.status === "retrying" ? "retry-successful" : "sent",
          },
        };

        roomToBroadcast.forEach((client) => {
          if (client !== socket) {
            // Forward chat message to other participants in the room
            client.send(JSON.stringify(updatedMsg));
          } else {
            // Acknowledge to the sender that their message has been sent
            client.send(JSON.stringify(sentAckMsg));
          }
        });

        console.log(
          `sent message ${msg.payload.id} to everyone in room ${msg.payload.roomId} (if there are any)`
        );
        break;
      }

      case "react": {
        const roomToBroadcast = roomsMap.get(msg.payload.roomId);

        if (!roomToBroadcast) {
          break;
        }

        roomToBroadcast.forEach((client) => {
          if (client !== socket) {
            client.send(JSON.stringify(msg));
          }
        });
        break;
      }

      case "update-status": {
        const roomToBroadcast = roomsMap.get(msg.payload.roomId);

        if (!roomToBroadcast) {
          break;
        }

        // TODO: handle different status updates accordingly
        switch (msg.payload.status) {
          case "delivered": {
            break;
          }

          case "read": {
            break;
          }

          default: {
            break;
          }
        }
        break;
      }

      default: {
        break;
      }
    }
  });

  // Remove connection from every room upon socket close
  socket.on("close", () => {
    for (const room of roomsMap.values()) {
      room.delete(socket);
    }
  });
}

export async function getChatRoomsByUserId(
  userId: number
): Promise<ChatRoom[]> {
  const rooms = ALL_MOCK_CHAT_ROOMS.filter((room) =>
    room.members.some((member) => member.id === userId)
  );

  return rooms;
}

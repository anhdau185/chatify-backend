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

const roomsMap = new Map<RoomID, Map<UserID, WebSocket>>(); // Map of room ID to a map of user ID to their socket
const deliveredMessageIds = new Set<MessageID>();
// const readMessageIds = new Set<MessageID>();

export function handleIncomingClient(socket: WebSocket) {
  socket.on("message", (raw) => {
    const msg: WsMessage = JSON.parse(raw.toString());

    switch (msg.type) {
      case "join": {
        msg.payload.roomIds.forEach((roomId) => {
          console.log(
            `received a request to join room ${roomId} from user ${msg.payload.senderId}`
          );

          // Get the room to join, create new one beforehand if not existing
          if (!roomsMap.has(roomId)) {
            roomsMap.set(roomId, new Map<UserID, WebSocket>());
          }

          const roomToJoin = roomsMap.get(roomId);
          if (!roomToJoin) {
            return;
          }

          // Get existing socket for this user in this room (if any)
          const existingSocket = roomToJoin.get(msg.payload.senderId);
          if (existingSocket) {
            existingSocket.close(); // Close the old socket
            roomToJoin.delete(msg.payload.senderId); // Remove old mapping
          }

          // Add new socket mapping for this user
          roomToJoin.set(msg.payload.senderId, socket);
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

        roomToBroadcast.forEach((clientSocket, userId) => {
          if (clientSocket !== socket) {
            // Forward chat message to other participants in the room
            clientSocket.send(JSON.stringify(updatedMsg));
          } else {
            // Acknowledge to the sender that their message has been sent
            clientSocket.send(JSON.stringify(sentAckMsg));
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

        roomToBroadcast.forEach((clientSocket, userId) => {
          if (clientSocket !== socket) {
            clientSocket.send(JSON.stringify(msg));
          }
        });
        break;
      }

      case "update-status": {
        switch (msg.payload.status) {
          case "delivered": {
            if (deliveredMessageIds.has(msg.payload.id)) {
              // A recipient has already acknowledged the delivery of this message
              // and server might have broadcasted an ack msg to the sender
              break;
            }

            const roomToBroadcast = roomsMap.get(msg.payload.roomId);
            if (!roomToBroadcast) {
              break;
            }

            // Get the right client socket to broadcast to
            const senderSocket = roomToBroadcast.get(msg.payload.senderId);
            if (!senderSocket) {
              break;
            }

            // Notify the sender that their message has been delivered to at least one recipient
            // Add a small jitter to avoid race conditions with other ealier acks (like "sent")
            setTimeout(() => senderSocket.send(JSON.stringify(msg)), 300);
            deliveredMessageIds.add(msg.payload.id);
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
      // Find and remove this socket from any user in the room
      for (const [userId, clientSocket] of room.entries()) {
        if (clientSocket === socket) {
          room.delete(userId);
          break; // One user can only have one socket in a room
        }
      }
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

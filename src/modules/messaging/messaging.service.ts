import type { WebSocket } from "@fastify/websocket";

import { ALL_MOCK_CHAT_ROOMS } from "./messaging.mockdb.js";
import type { ChatRoom, WsMessage } from "./messaging.type.js";

const roomsMap = new Map<string, Set<WebSocket>>();
// const users = new Map<number, Set<string>>();
// track user's rooms (optional, for future use)
// if (!users.has(senderId)) {
//   users.set(senderId, new Set());
// }
// const userRooms = users.get(senderId);
// if (!userRooms) {
//   return;
// }
// if (userRooms.has(roomId)) {
//   console.log(`user ${senderId} is already in room ${roomId}`);
//   return;
// }
// userRooms.add(roomId);

export function handleIncomingClient(socket: WebSocket) {
  socket.on("message", (raw) => {
    const msg: WsMessage = JSON.parse(raw.toString());

    switch (msg.type) {
      case "join":
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

      case "chat":
        console.log(
          `received message "${msg.payload.content}" (uuid: ${msg.payload.id}) from sender ${msg.payload.senderId}`
        );

        const roomToBroadcast = roomsMap.get(msg.payload.roomId);

        if (!roomToBroadcast) {
          return;
        }

        roomToBroadcast.forEach((client) => {
          if (client !== socket) client.send(JSON.stringify(msg));
        });
        console.log(
          `sent message ${msg.payload.id} to everyone in room ${msg.payload.roomId} (if there are any)`
        );
        break;
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

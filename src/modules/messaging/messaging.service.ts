import type { WebSocket } from "@fastify/websocket";

import type { WsMessage } from "./messaging.type.js";

const rooms = new Map<string, Set<WebSocket>>();

export function handleIncomingClient(socket: WebSocket) {
  socket.on("message", (raw) => {
    const msg: WsMessage = JSON.parse(raw.toString());
    const { roomId, senderId } = msg.payload;

    switch (msg.type) {
      case "join":
        console.log(
          `received a request to join room ${msg.payload.roomId} from user ${msg.payload.senderId}`
        );

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }

        const roomToJoin = rooms.get(roomId);

        if (!roomToJoin) {
          return;
        }

        roomToJoin.add(socket);
        console.log(`user ${senderId} has been added to room ${roomId}`);
        break;

      case "chat":
        console.log(
          `received message "${msg.payload.content}" (uuid: ${msg.payload.id}) from sender ${msg.payload.senderId}`
        );

        const roomToBroadcast = rooms.get(roomId);

        if (!roomToBroadcast) {
          return;
        }

        roomToBroadcast.forEach((client) => {
          if (client !== socket) client.send(JSON.stringify(msg));
        });
        console.log(
          `sent message ${msg.payload.id} to everyone in room ${roomId} (if there are any)`
        );
        break;
    }
  });

  // Remove connection from every room upon socket close
  socket.on("close", () => {
    for (const room of rooms.values()) {
      room.delete(socket);
    }
  });
}

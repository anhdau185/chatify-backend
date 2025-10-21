import type { WebSocket } from "@fastify/websocket";
import type { FastifyInstance } from "fastify";

type Message =
  | {
      type: "join";
      roomId: string;
    }
  | {
      type: "message";
      roomId: string;
      text: string;
    };

const rooms = new Map<string, Set<WebSocket>>();
const COOKIE_NAME = "chatify_access_jwt";

export default async function messagingRoutes(fastify: FastifyInstance) {
  fastify.get("/ws", { websocket: true }, (socket, request) => {
    // TODO: authenticate user here
    const token = request.cookies[COOKIE_NAME];
    console.log(`${COOKIE_NAME}=${token}`);

    socket.on("message", (raw) => {
      const msg: Message = JSON.parse(raw.toString());

      switch (msg.type) {
        case "join":
          if (!rooms.has(msg.roomId)) {
            rooms.set(msg.roomId, new Set());
          }

          const roomToJoin = rooms.get(msg.roomId);
          if (roomToJoin) {
            roomToJoin.add(socket);
            console.log(`a person has been added to the room ${msg.roomId}`);
          }
          break;

        case "message":
          const roomToBroadcast = rooms.get(msg.roomId);
          if (roomToBroadcast) {
            roomToBroadcast.forEach((client) => {
              if (client !== socket) {
                client.send(JSON.stringify(msg));
                console.log(
                  `sent "${msg.text}" to a person in the room "${msg.roomId}"`
                );
              }
            });
          }
          break;
      }
    });

    // Remove connection from every room upon socket close
    socket.on("close", () => {
      for (const room of rooms.values()) {
        room.delete(socket);
      }
    });
  });
}

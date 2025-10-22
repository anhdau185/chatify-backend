interface ChatRoom {
  id: string;
  name?: string; // for group chats
  members: string[]; // user IDs
  isGroup: boolean;
}

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content?: string;
  imageUrl?: string;
  reactions?: Record<string, string[]>; // emoji -> userIds[]
  createdAt: number;
  status: "sending" | "sent" | "failed"; // add 'read' later
}

export type { ChatRoom, Message };

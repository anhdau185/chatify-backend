# chatify-backend

The backend serving the Chatify frontend app.

## Getting Started

Before starting coding, create in-memory mock databases by adding these files:

- `src/modules/user/user.db.ts`
- `src/modules/messaging/.db.ts`

For example:

```ts
// src/modules/user/user.db.ts
import type { User } from "./user.type";

const MOCK_USER_1: User = {
  id: 1,
  name: "Chatify_1",
  email: null,
  username: "chatify1",
  hashedPassword: "your hashed password for this user",
};

const MOCK_USER_2: User = {
  id: 2,
  name: "Chatify_2",
  email: null,
  username: "chatify2",
  hashedPassword: "your hashed password for this user",
};

export { MOCK_USER_1, MOCK_USER_2 };
```

and

```ts
// src/modules/messaging/.db.ts
import type { ChatRoom } from "./messaging.type";

const MOCK_CHAT_ROOM_1: ChatRoom = {
  id: "8897c46b-7fd8-45a4-a12b-8dabf64e4427",
  members: [1, 2], // MOCK_USER_1 and MOCK_USER_2
  isGroup: false, // 1:1 DM conversation
};

export { MOCK_CHAT_ROOM_1 };
```

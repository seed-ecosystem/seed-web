import {ChatMessage} from "@/modules/chat/persistence/chat-message.ts";
import {Chat} from "@/deprecated-persistence/chat/chat.ts";
import {IDBPDatabase} from "idb";

export interface MessageStorage {
  lastMessage(chat: Chat): Promise<ChatMessage | undefined>
  lastMessageNonce(chat: Chat): Promise<number>;
  add(message: ChatMessage): Promise<void>;
  list(chat: Chat): Promise<ChatMessage[]>;
}

export function createMessageObjectStore(db: IDBPDatabase){
  db.createObjectStore("message", {
    keyPath: ["nonce", "chatId"]
  }).createIndex("chatId", "chatId", { unique: false });
}

export function createMessageStorage(db: IDBPDatabase): MessageStorage {
  return {
    async lastMessage(chat: Chat): Promise<ChatMessage | undefined> {
      const cursor = await db.transaction("message")
        .objectStore("message")
        .index("chatId")
        .openCursor(IDBKeyRange.only(chat.chatId));

      if (!cursor) return;

      return cursor.value;
    },

    async lastMessageNonce(chat: Chat): Promise<number> {
      const cursor = await db.transaction("message")
        .objectStore("message")
        .index("chatId")
        .openCursor(IDBKeyRange.only(chat.chatId), "prev");

      if (cursor === null) {
        return 0;
      }

      const message: ChatMessage = cursor.value;

      return message.content.type == "deferred"
        ? message.nonce
        : message.nonce + 1;
    },

    async add(message: ChatMessage): Promise<void> {
      await db.transaction("message", "readwrite")
        .objectStore("message")
        .put/**/(message);
    },

    async list(chat: Chat): Promise<ChatMessage[]> {
      const cursor = await db.transaction("message")
        .objectStore("message")
        .index("chatId")
        .openCursor(IDBKeyRange.only(chat.chatId), "prev");

      if (!cursor) return [];

      const result: ChatMessage[] = [];
      for await (const message of cursor) {
        result.push(message.value);
      }
      return result;
    }
  };
}

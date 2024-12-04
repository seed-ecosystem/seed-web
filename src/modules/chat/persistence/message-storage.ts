import {ChatMessage} from "@/modules/chat/persistence/chat-message.ts";
import {IDBPDatabase} from "idb";

export interface MessageStorage {
  lastMessage({chatId}: {chatId: string}): Promise<ChatMessage | undefined>
  add(message: ChatMessage): Promise<void>;
  list({chatId}: {chatId: string}): Promise<ChatMessage[]>;
}

export function createMessageObjectStore(db: IDBPDatabase){
  db.createObjectStore("message", {
    keyPath: ["nonce", "chatId"]
  }).createIndex("chatId", "chatId", { unique: false });
}

export function createMessageStorage(db: IDBPDatabase): MessageStorage {
  return {
    async lastMessage({chatId}): Promise<ChatMessage | undefined> {
      const cursor = await db.transaction("message")
        .objectStore("message")
        .index("chatId")
        .openCursor(IDBKeyRange.only(chatId), "prev");

      if (!cursor) return;

      return cursor.value;
    },

    async add(message: ChatMessage): Promise<void> {
      await db.transaction("message", "readwrite")
        .objectStore("message")
        .put(message);
    },

    async list({chatId}): Promise<ChatMessage[]> {
      const cursor = await db.transaction("message")
        .objectStore("message")
        .index("chatId")
        .openCursor(IDBKeyRange.only(chatId), "prev");

      if (!cursor) return [];

      const result: ChatMessage[] = [];
      for await (const message of cursor) {
        result.push(message.value);
      }
      return result;
    }
  };
}

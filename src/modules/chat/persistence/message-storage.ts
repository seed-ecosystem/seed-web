import {ChatMessage} from "@/modules/chat/persistence/chat-message.ts";
import {IDBPDatabase} from "idb";
import {RandomRanger} from "typia/lib/programmers/helpers/RandomRanger";
import number = RandomRanger.number;

export interface MessageStorage {
  lastMessage(options: {chatId: string}): Promise<ChatMessage | undefined>
  add(message: ChatMessage): Promise<void>;
  get(options: {chatId: string, nonce: number}): Promise<ChatMessage | undefined>;
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

    async get({ chatId, nonce }): Promise<ChatMessage | undefined> {
      return await db.transaction("message", "readwrite")
        .store
        .get(IDBKeyRange.only([nonce, chatId]));
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

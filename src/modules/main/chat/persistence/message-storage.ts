import { ChatMessage } from "@/modules/main/chat/persistence/chat-message.ts";
import { IDBPDatabase } from "idb";

export interface MessageStorage {
  lastMessage(options: { url: string, queueId: string }): Promise<ChatMessage | undefined>
  add(message: ChatMessage[]): Promise<void>;
  get(options: { url: string, queueId: string, nonce: number }): Promise<ChatMessage | undefined>;
  list(options: { url: string, queueId: string }): Promise<ChatMessage[]>;
}

export function createMessageObjectStore(db: IDBPDatabase) {
  db.createObjectStore("message-v2", {
    keyPath: ["nonce", "url", "queueId"],
  }).createIndex("queueId", ["url", "queueId"], { unique: false });
}

export function createMessageStorage(db: IDBPDatabase): MessageStorage {
  return {
    async lastMessage({ url, queueId }): Promise<ChatMessage | undefined> {
      const cursor = await db.transaction("message-v2")
        .store.index("queueId")
        .openCursor(IDBKeyRange.only([url, queueId]), "prev");

      if (!cursor) return;

      return cursor.value as ChatMessage | undefined;
    },

    async add(messages: ChatMessage[]): Promise<void> {
      const transaction = db.transaction("message-v2", "readwrite");
      await Promise.all([
        ...messages.map(message => transaction.store.put(message)),
        transaction.done,
      ]);
    },

    async get({ url, queueId, nonce }): Promise<ChatMessage | undefined> {
      return await db.transaction("message-v2", "readwrite")
        .store
        .get(IDBKeyRange.only([nonce, url, queueId])) as ChatMessage | undefined;
    },

    async list({ url, queueId }): Promise<ChatMessage[]> {
      const cursor = await db.transaction("message-v2")
        .store.index("queueId")
        .openCursor(IDBKeyRange.only([url, queueId]), "prev");

      if (!cursor) return [];

      const result: ChatMessage[] = [];
      for await (const message of cursor) {
        result.push(message.value as ChatMessage);
      }
      return result;
    },
  };
}

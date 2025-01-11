import {IDBPDatabase} from "idb";
import {Chat} from "@/modules/main/chat-list/persistence/chat.ts";

export interface ChatStorage {
  put(chat: Chat): Promise<void>;
  list(): Promise<Chat[]>;
  get(id: string): Promise<Chat>;
  exists(id: string): Promise<boolean>;
  updateLastMessageDate(id: string, date: Date): Promise<void>;
  delete(id: string): Promise<void>;
}

export function createChatObjectStore(db: IDBPDatabase){
  db.createObjectStore("chat", {
    keyPath: "id"
  }).createIndex("lastMessageDate", "lastMessageDate");
}

export function createChatStorage(db: IDBPDatabase): ChatStorage {
  return {
    async put(chat: Chat): Promise<void> {
      await db.transaction("chat", "readwrite").store.put(chat);
    },

    async get(id: string): Promise<Chat> {
      return await db.transaction("chat").store.get(IDBKeyRange.only(id));
    },

    async delete(id: string): Promise<void> {
      await db.transaction("chat", "readwrite").store.delete(IDBKeyRange.only(id));
    },

    async exists(id: string): Promise<boolean> {
      return (await db.transaction("chat").store.count(IDBKeyRange.only(id))) > 0;
    },

    async list(): Promise<Chat[]> {
      return (await db.transaction("chat").store.index("lastMessageDate").getAll()).reverse();
    },

    async updateLastMessageDate(id: string, date: Date): Promise<void> {
      const tx = db.transaction("chat", "readwrite");
      const store = tx.store;
      const chat = await store.get(IDBKeyRange.only(id));
      if (chat) {
        chat.lastMessageDate = date;
        await store.put(chat);
      }
      await tx.done;
    },
  };
}

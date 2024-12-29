import {IDBPDatabase} from "idb";
import {Chat} from "@/modules/chat-list/persistence/chat.ts";

export interface ChatStorage {
  add(chat: Chat): Promise<void>;
  list(): Promise<Chat[]>;
  get(id: string): Promise<Chat>;
  exists(id: string): Promise<boolean>;
}

export function createChatObjectStore(db: IDBPDatabase){
  db.createObjectStore("chat", {
    keyPath: "id"
  });
}

export function createChatStorage(db: IDBPDatabase): ChatStorage {
  return {
    async add(chat: Chat): Promise<void> {
      await db.transaction("chat", "readwrite").store.put(chat);
    },

    async get(id: string): Promise<Chat> {
      return await db.transaction("chat").store.get(IDBKeyRange.only(id));
    },

    async exists(id: string): Promise<boolean> {
      return (await db.transaction("chat").store.count(IDBKeyRange.only(id))) > 0;
    },

    async list(): Promise<Chat[]> {
      return await db.transaction("chat").store.getAll();
    }
  };
}

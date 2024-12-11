import {ChatMessage} from "@/modules/chat/persistence/chat-message.ts";
import {IDBPDatabase} from "idb";
import {Chat} from "@/modules/chat-list/persistence/chat.ts";

export interface ChatStorage {
  add(chat: Chat): Promise<void>;
  list(): Promise<Chat[]>;
}

export function createChatObjectStore(db: IDBPDatabase){
  db.createObjectStore("chat", { keyPath: ["id"] });
}

export function createChatStorage(db: IDBPDatabase): ChatStorage {
  return {
    async add(chat: Chat): Promise<void> {
      await db.transaction("chat", "readwrite").store.put(chat);
    },

    async list(): Promise<Chat[]> {
      return await db.transaction("chat").store.getAll();
    }
  };
}

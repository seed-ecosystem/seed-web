import {ChatStorage} from "@/persistence/chat/chat-storage.ts";
import {Chat} from "@/persistence/chat/chat.ts";
import {IDBPDatabase} from "idb";

export function createChatObjectStore(db: IDBPDatabase) {
  return db.createObjectStore("chat");
}

export function createChatStorage(db: IDBPDatabase): ChatStorage {
  return {
    add(chat: Chat): Promise<void> {
      return Promise.resolve(undefined);
    },
    list(): Promise<Chat[]> {
      return Promise.resolve([]);
    }
  };
}

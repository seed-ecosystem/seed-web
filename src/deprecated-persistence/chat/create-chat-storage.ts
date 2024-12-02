import {ChatStorage} from "@/deprecated-persistence/chat/chat-storage.ts";
import {Chat} from "@/deprecated-persistence/chat/chat.ts";
import {IDBPDatabase} from "idb";
import {randomAESKey} from "@/modules/crypto/subtle-crypto.ts";

export function createChatObjectStore(db: IDBPDatabase) {
  return db.createObjectStore("chat");
}

export function createChatStorage(db: IDBPDatabase): ChatStorage {
  return {
    getInitialKey(chat: Chat): Promise<string> {
      return randomAESKey();
    },
    add(chat: Chat): Promise<void> {
      return Promise.resolve(undefined);
    },
    list(): Promise<Chat[]> {
      return Promise.resolve([]);
    }
  };
}

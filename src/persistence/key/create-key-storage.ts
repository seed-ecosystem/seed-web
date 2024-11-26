import {KeyStorage} from "@/persistence/key/key-storage.ts";
import {Chat} from "@/persistence/chat/chat.ts";
import {IDBPDatabase} from "idb";
import {Key} from "@/persistence/key/key.ts";

export function createKeyObjectStore(db: IDBPDatabase){
  db.createObjectStore("key", {
    keyPath: ["chatId", "nonce"]
  }).createIndex("chatId", "chatId", { unique: false });
}

export function createKeyStorage(db: IDBPDatabase): KeyStorage {
  return {
    async get({ chat, nonce }) {
      const result: Key | undefined = await db.transaction("key")
        .objectStore("key")
        .get(IDBKeyRange.only([chat.chatId, nonce]));

      if (!result) {
        return;
      }

      return result.string;
    },

    async last({ chat }) {
      const result = await db.transaction("key")
        .objectStore("key")
        .index("chatId")
        .openCursor(IDBKeyRange.only(chat.chatId), "next")

      if (!result) {
        return;
      }

      return {
        key: result.value.string,
        nonce: result.value.nonce,
      };
    },

    async push({ chat, key, nonce }) {
      await db.transaction("key", "readwrite").store
        .add({
          chatId: chat.chatId,
          string: key,
          nonce: nonce,
        });
    }
  };
}

import {IDBPDatabase, IDBPObjectStore} from "idb";
import {Chat} from "@/persistence/chat/chat.ts";
import {MessageStorage} from "@/persistence/message/message-storage.ts";
import {Message} from "@/persistence/message/message.ts";

export function createMessageObjectStore(db: IDBPDatabase){
  db.createObjectStore("message", {
    keyPath: ["nonce", "chatId"]
  }).createIndex("chatId", "chatId", { unique: false });
}

export function createMessageStorage(db: IDBPDatabase): MessageStorage {
  return {
    async lastMessage(chat: Chat): Promise<Message | undefined> {
      const cursor = await db.transaction("message")
        .objectStore("message")
        .index("chatId")
        .openCursor(IDBKeyRange.only(chat.chatId), "prev");

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

      const message: Message = cursor.value;

      return message.content.type == "deferred"
        ? message.nonce
        : message.nonce + 1;
    },

    async add(message: Message): Promise<void> {
      await db.transaction("message", "readwrite")
        .objectStore("message")
        .put/**/(message);
    },

    async list(chat: Chat): Promise<Message[]> {
      const cursor = await db.transaction("message")
        .objectStore("message")
        .index("chatId")
        .openCursor(IDBKeyRange.only(chat.chatId), "prev");

      if (!cursor) return [];

      const result: Message[] = [];
      for await (const message of cursor) {
        result.push(message.value);
      }
      return result;
    }
  };
}

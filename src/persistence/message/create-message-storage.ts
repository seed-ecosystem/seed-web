import {IDBPDatabase, IDBPObjectStore} from "idb";
import {Chat} from "@/persistence/chat/chat.ts";
import {MessageStorage} from "@/persistence/message/message-storage.ts";
import {Message} from "@/persistence/message/message.ts";

export function createChatObjectStore(db: IDBPDatabase){
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
        .openCursor(IDBKeyRange.only(chat.chatId), "next");

      if (cursor === null) {
        return;
      }

      return cursor.value
    },

    async add(message: Message): Promise<void> {
      await db.transaction("message", "readwrite")
        .objectStore("message")
        .add({
          chatId: message.chat.chatId,
          ...message
        });
    },

    async list(chat: Chat, fromId: number, amount: number): Promise<Message[]> {
      const cursor = await db.transaction("message")
        .objectStore("message")
        .index("chatId")
        .openCursor(IDBKeyRange.only(chat.chatId));

      if (!cursor) return [];

      const result = [];
      const first = fromId ? await cursor.advance(fromId) : cursor;
      if (!first) return [];

      for await (const next of cursor) {
        if (amount <= 0) return result;
        delete next.value.chatId
        result.push(next.value);
        amount--
      }

      return result;
    }
  };
}

import {
  createMessageObjectStore,
  createMessageStorage,
  MessageStorage
} from "@/worker/persistence/message/message-storage.ts";
import {
  createNicknameObjectStore,
  createNicknameStorage,
  NicknameStorage
} from "@/worker/persistence/nickname/nickname-storage.ts";
import {openDB} from "idb";
import {ChatStorage, createChatObjectStore, createChatStorage} from "@/worker/persistence/chat-list/chat-storage.ts";
import {createKeyObjectStore, createKeyStorage, KeyStorage} from "@/worker/persistence/key/key-storage.ts";

export interface SeedPersistence {
  message: MessageStorage;
  nickname: NicknameStorage;
  chat: ChatStorage;
  key: KeyStorage;
}

export async function createPersistence(): Promise<SeedPersistence> {
  const db = await openDB("persistence", 8, {
    async upgrade(db, version, _, transaction) {
      // Full schema creation
      if (version == 0) {
        createNicknameObjectStore(db);
        createMessageObjectStore(db);
        createChatObjectStore(db);
        createKeyObjectStore(db);
        return;
      }
      if (version <= 2) {
        createChatObjectStore(db);
      }
      if (version <= 5) {
        db.deleteObjectStore("message");
        db.deleteObjectStore("chat");
        createMessageObjectStore(db);
        createChatObjectStore(db);
      }
      if (version <= 6) {
        const chatStore = transaction.objectStore("chat");
        chatStore.createIndex("lastMessageDate", "lastMessageDate");

        const cursor = await chatStore.openCursor();
        while (cursor?.value) {
          const chat = cursor.value;
          chat.lastMessageDate = new Date(); // Assign current date
          await chatStore.put(chat);
          await cursor.continue();
        }
      }
      if (version <= 7) {
        const chatStore = transaction.objectStore("chat");

        const cursor = await chatStore.openCursor();
        for await (const {value: chat} of cursor!) {
          chat.unreadCount = 0;
          await chatStore.put(chat);
        }
      }
    }
  });

  return {
    message: createMessageStorage(db),
    nickname: createNicknameStorage(db),
    chat: createChatStorage(db),
    key: createKeyStorage(db)
  };
}

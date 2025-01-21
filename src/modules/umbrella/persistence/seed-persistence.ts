import {
  createMessageObjectStore,
  createMessageStorage,
  MessageStorage
} from "@/modules/main/chat/persistence/message-storage.ts";
import {
  createNicknameObjectStore,
  createNicknameStorage,
  NicknameStorage
} from "@/modules/main/chat/persistence/nickname-storage.ts";
import {openDB} from "idb";
import {ChatStorage, createChatObjectStore, createChatStorage} from "@/modules/main/chat-list/persistence/chat-storage.ts";
import {createKeyObjectStore, createKeyStorage, KeyStorage} from "@/modules/main/chat/persistence/key-storage.ts";

export interface SeedPersistence {
  message: MessageStorage;
  nickname: NicknameStorage;
  chat: ChatStorage;
  key: KeyStorage;
}

export async function createPersistence(): Promise<SeedPersistence> {
  const db = await openDB("persistence", 9, {
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
      if (version <= 8) {
        const chatStore = transaction.objectStore("chat");

        const cursor = await chatStore.openCursor();
        for await (const {value: chat} of cursor!) {
          chat.serverUrl = "https://meetacy.app/seed-go";
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

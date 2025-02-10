/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  createMessageObjectStore,
  createMessageStorage,
  MessageStorage,
} from "@/modules/main/chat/persistence/message-storage.ts";
import {
  createNicknameObjectStore,
  createNicknameStorage,
  NicknameStorage,
} from "@/modules/main/chat/persistence/nickname-storage.ts";
import { openDB } from "idb";
import { ChatStorage, createChatObjectStore, createChatStorage } from "@/modules/main/chat-list/persistence/chat-storage.ts";
import { createKeyObjectStore, createKeyStorage, KeyStorage } from "@/modules/main/chat/persistence/key-storage.ts";
import { Chat } from "@/modules/main/chat-list/persistence/chat";

export interface SeedPersistence {
  message: MessageStorage;
  nickname: NicknameStorage;
  chat: ChatStorage;
  key: KeyStorage;
}

export async function createPersistence(): Promise<SeedPersistence> {
  const db = await openDB("persistence", 11, {
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
          const chat: Chat = cursor.value as Chat;
          chat.lastMessageDate = new Date(); // Assign current date
          await chatStore.put(chat);
          await cursor.continue();
        }
      }
      if (version <= 7) {
        const chatStore = transaction.objectStore("chat");

        const cursor = await chatStore.openCursor();
        if (cursor) {
          for await (const { value: chat } of cursor) {
            (chat as Chat).unreadCount = 0;
            await chatStore.put(chat);
          }
        }
      }
      if (version <= 8) {
        const chatStore = transaction.objectStore("chat");

        const cursor = await chatStore.openCursor();
        if (cursor) {
          for await (const { value: chat } of cursor) {
            (chat as Chat).serverUrl = "https://meetacy.app/seed-go";
            await chatStore.put(chat);
          }
        }
      }
      if (version <= 9) {
        createMessageObjectStore(db);

        const messageStore = transaction.objectStore("message");
        const messageV2Store = transaction.objectStore("message-v2");

        const cursor = await messageStore.openCursor();
        if (cursor) {
          for await (const { value: message } of cursor) {
            message.queueId = message.chatId;
            message.url = "wss://meetacy.app/seed-go";
            await messageV2Store.put(message);
          }
        }

        db.deleteObjectStore("message");
      }
      if (version <= 10) {
        const chatStore = transaction.objectStore("chat");

        const cursor = await chatStore.openCursor();
        if (cursor) {
          for await (const { value: chat } of cursor) {
            (chat as Chat).serverUrl = "wss://meetacy.app/seed-go";
            await chatStore.put(chat);
          }
        }
      }
    },
  });

  return {
    message: createMessageStorage(db),
    nickname: createNicknameStorage(db),
    chat: createChatStorage(db),
    key: createKeyStorage(db),
  };
}

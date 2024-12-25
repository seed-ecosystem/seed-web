import {
  createMessageObjectStore,
  createMessageStorage,
  MessageStorage
} from "@/modules/chat/persistence/message-storage.ts";
import {
  createNicknameObjectStore,
  createNicknameStorage,
  NicknameStorage
} from "@/modules/chat/persistence/nickname-storage.ts";
import {openDB} from "idb";
import {ChatStorage, createChatObjectStore, createChatStorage} from "@/modules/chat-list/persistence/chat-storage.ts";
import {node} from "globals";

export interface SeedPersistence {
  message: MessageStorage;
  nickname: NicknameStorage;
  chat: ChatStorage;
}

export async function createPersistence(): Promise<SeedPersistence> {
  const db = await openDB("persistence", 4, {
    upgrade(db, version) {
      if (version == 3) {
        db.deleteObjectStore("message");
        db.deleteObjectStore("chat");
        version = 0;
      }
      // Full schema creation
      if (version == 0) {
        createNicknameObjectStore(db);
        createMessageObjectStore(db);
        createChatObjectStore(db);
        return;
      }
      // Additions for intermediate versions
      if (version >= 2) {
        createChatObjectStore(db);
      }
    }
  });

  return {
    message: createMessageStorage(db),
    nickname: createNicknameStorage(db),
    chat: createChatStorage(db),
  };
}

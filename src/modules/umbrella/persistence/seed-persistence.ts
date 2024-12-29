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
import {createKeyObjectStore, createKeyStorage, KeyStorage} from "@/modules/chat/persistence/key-storage.ts";

export interface SeedPersistence {
  message: MessageStorage;
  nickname: NicknameStorage;
  chat: ChatStorage;
  key: KeyStorage;
}

export async function createPersistence(): Promise<SeedPersistence> {
  const db = await openDB("persistence", 6, {
    async upgrade(db, version) {
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
    }
  });

  return {
    message: createMessageStorage(db),
    nickname: createNicknameStorage(db),
    chat: createChatStorage(db),
    key: createKeyStorage(db)
  };
}

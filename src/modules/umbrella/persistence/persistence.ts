import {createMessageStorage, MessageStorage} from "@/modules/chat/persistence/message-storage.ts";
import {
  createNicknameObjectStore,
  createNicknameStorage,
  NicknameStorage
} from "@/modules/chat/persistence/nickname-storage.ts";
import {openDB} from "idb";
import {createChatObjectStore} from "@/deprecated-persistence/chat/create-chat-storage.ts";

export interface Persistence {
  message: MessageStorage;
  nickname: NicknameStorage;
}

export async function createPersistence(): Promise<Persistence> {
  const db = await openDB("persistence", 2, {
    upgrade(database, version) {
      if (version == 0) {
        createChatObjectStore(database);
        createNicknameObjectStore(database);
      }
      if (version >= 1) {
        createNicknameObjectStore(database);
      }
    }
  });

  return {
    message: createMessageStorage(db),
    nickname: createNicknameStorage(db)
  };
}

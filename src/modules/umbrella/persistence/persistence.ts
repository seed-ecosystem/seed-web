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

export interface Persistence {
  message: MessageStorage;
  nickname: NicknameStorage;
}

export async function createPersistence(): Promise<Persistence> {
  const db = await openDB("persistence", 2, {
    upgrade(database, version) {
      if (version == 0) {
        createNicknameObjectStore(database);
        createMessageObjectStore(database);
      }
    }
  });

  return {
    message: createMessageStorage(db),
    nickname: createNicknameStorage(db)
  };
}

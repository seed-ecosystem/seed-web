import {Persistence} from "@/persistence/persistence.ts";
import {openDB} from "idb";
import {createChatObjectStore, createChatStorage} from "@/persistence/chat/create-chat-storage.ts";
import {createMessageObjectStore, createMessageStorage} from "@/persistence/message/create-message-storage.ts";
import {createKeyObjectStore, createKeyStorage} from "@/persistence/key/create-key-storage.ts";

export async function createPersistence(): Promise<Persistence> {
  const db = await openDB("persistence", 1, {
    upgrade(database) {
      createMessageObjectStore(database);
      createKeyObjectStore(database);
      createChatObjectStore(database);
    }
  });

  return {
    chat: createChatStorage(db),
    message: createMessageStorage(db),
    key: createKeyStorage(db)
  };
}

import {Persistence} from "@/persistence/persistence.ts";
import {openDB} from "idb";
import {createChatStorage} from "@/persistence/chat/create-chat-storage.ts";
import {createChatObjectStore, createMessageStorage} from "@/persistence/message/create-message-storage.ts";

export async function createPersistence(): Promise<Persistence> {
  const db = await openDB("persistence", 1, {
    upgrade(database) {
      createChatObjectStore(database);
    }
  });

  return {
    chat: createChatStorage(db),
    message: createMessageStorage(db)
  };
}

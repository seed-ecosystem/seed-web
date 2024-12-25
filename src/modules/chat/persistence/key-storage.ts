import {IDBPDatabase} from "idb";

export type Key = {
  chatId: string;
  nonce: number;
  key: string;
}

export interface KeyStorage {
  lastKey(options: {chatId: string}): Promise<Key | undefined>
  add(key: Key): Promise<void>;
  get(options: {chatId: string, nonce: number}): Promise<Key | undefined>;
}

export function createKeyObjectStore(db: IDBPDatabase){
  db.createObjectStore("key", {
    keyPath: ["nonce", "chatId"]
  }).createIndex("chatId", "chatId", { unique: false });
}

export function createKeyStorage(db: IDBPDatabase): KeyStorage {
  return {
    async lastKey({chatId}): Promise<Key | undefined> {
      const cursor = await db.transaction("key")
        .store.index("chatId")
        .openCursor(IDBKeyRange.only(chatId), "prev");

      if (!cursor) return;

      return cursor.value;
    },

    async add(key: Key): Promise<void> {
      await db.transaction("key", "readwrite")
        .store
        .put(key);
    },

    async get({ chatId, nonce }): Promise<Key | undefined> {
      return await db.transaction("key", "readwrite")
        .store
        .get(IDBKeyRange.only([nonce, chatId]));
    },
  };
}

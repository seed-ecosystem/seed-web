import {NicknameStorage} from "@/persistence/nickname/nickname-storage.ts";
import {IDBPDatabase} from "idb";

export function createNicknameObjectStore(db: IDBPDatabase){
  db.createObjectStore("nickname", {
    keyPath: "id"
  });
}

export function createNicknameStorage(db: IDBPDatabase): NicknameStorage {
  return {
    async getName() {
      const result = await db.transaction("nickname").store.getAll();
      if (result.length == 0) return;
      return result[0].nickname;
    },

    async setName(nickname: string): Promise<void> {
       await db.transaction("nickname", "readwrite").store.put({
         id: 1,
         nickname: nickname,
       });
    }
  };
}

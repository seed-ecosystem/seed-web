import {IndexedKey} from "@/sdk/worker/indexed-key.ts";

export type GetKeyAt = {
  chatId: string;
  nonce: number;
}

export type GetLastKeyOptions = {
  chatId: string;
}

export type GetInitialKeyOptions = {
  chatId: string;
}

export interface KeyPersistence {
  getKeyAt(options: GetKeyAt): Promise<string | undefined>;
  getLastKey(options: GetLastKeyOptions): Promise<IndexedKey | undefined>
  getInitialKey(options: GetInitialKeyOptions): Promise<IndexedKey>;
}

import {IndexedKey} from "@/sdk/worker/indexed-key.ts";

export type AddKeyOptions = {
  queueId: string;
  keys: IndexedKey[];
}

export type GetKeyAt = {
  queueId: string;
  nonce: number;
}

export type GetLastKeyOptions = {
  queueId: string;
}

export type GetInitialKeyOptions = {
  queueId: string;
}

export interface KeyPersistence {
  add(options: AddKeyOptions): Promise<void>;
  getKeyAt(options: GetKeyAt): Promise<string | undefined>;
  getLastKey(options: GetLastKeyOptions): Promise<IndexedKey | undefined>
  getInitialKey(options: GetInitialKeyOptions): Promise<IndexedKey>;
}

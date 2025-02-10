export type AddKeyOptions = {
  queueId: string;
  url: string;
  keys: IndexedKey[];
}

export type GetKeyAt = {
  queueId: string;
  url: string;
  nonce: number;
}

export type GetLastKeyOptions = {
  queueId: string;
  url: string;
}

export type GetInitialKeyOptions = {
  queueId: string;
  url: string;
}

export type IndexedKey = {
  key: string;
  nonce: number;
}

export interface KeyPersistence {
  add(options: AddKeyOptions): Promise<void>;
  getKeyAt(options: GetKeyAt): Promise<string | undefined>;
  getLastKey(options: GetLastKeyOptions): Promise<IndexedKey | undefined>
  getInitialKey(options: GetInitialKeyOptions): Promise<IndexedKey>;
}

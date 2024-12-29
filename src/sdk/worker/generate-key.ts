import {deriveNextKey} from "@/sdk/crypto/derive-next-key.ts";
import {IndexedKey} from "@/sdk/worker/indexed-key.ts";
import {KeyPersistence} from "@/sdk/worker/key-persistence.ts";

export type GenerateNewKeyOptions = {
  chatId: string;
  persistence: KeyPersistence;
  cache: IndexedKey[];
}

export async function generateNewKey(
  {chatId, persistence, cache}: GenerateNewKeyOptions
): Promise<IndexedKey> {
  let last = await persistence.getLastKey({ chatId });

  if (cache.length > 0) {
    const cachedKey = cache[cache.length - 1];
    if (!last || last.nonce < cachedKey.nonce) {
      last = cachedKey;
    }
  }

  let newKey;
  let newNonce;

  if (last) {
    newKey = await deriveNextKey({ key: last.key });
    newNonce = last.nonce + 1;
  } else {
    const {key, nonce} = await persistence.getInitialKey({ chatId });
    newKey = key;
    newNonce = nonce;
  }

  return {
    key: newKey,
    nonce: newNonce,
  };
}

export type GenerateKeyAtOptions = {
  nonce: number;
  chatId: string;
  persistence: KeyPersistence;
  cache: IndexedKey[];
}

export async function generateKeyAt({chatId, nonce, persistence, cache}: GenerateKeyAtOptions): Promise<string> {
  let existing = await persistence.getKeyAt({ chatId, nonce });
  if (existing) return existing;
  existing = cache.find(value => value.nonce == nonce)?.key;
  if (existing) return existing;

  let {nonce: lastNonce, key: lastKey} = await generateNewKey({ chatId, persistence, cache });

  if (lastNonce > nonce) {
    throw new Error("Cannot generate key backwards: from " + lastNonce + " to " + nonce);
  }

  cache.push({ key: lastKey, nonce: lastNonce});

  while (lastNonce < nonce) {
    lastKey = await deriveNextKey({ key: lastKey });
    lastNonce++;
    cache.push({ key: lastKey, nonce: lastNonce});
  }

  return lastKey;
}

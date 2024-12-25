import {deriveNextKey} from "@/sdk/crypto/derive-next-key.ts";
import {IndexedKey} from "@/sdk/worker/indexed-key.ts";
import {KeyPersistence} from "@/sdk/worker/key-persistence.ts";

export type GenerateNewKeyOptions = {
  chatId: string;
  persistence: KeyPersistence;
}

export async function generateNewKey(
  {chatId, persistence}: GenerateNewKeyOptions
): Promise<IndexedKey> {
  const last = await persistence.getLastKey({ chatId });

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
}

export async function generateKeyAt({chatId, nonce, persistence}: GenerateKeyAtOptions): Promise<string> {
  const existing = await persistence.getKeyAt({ chatId, nonce });
  if (existing) return existing;

  let {nonce: lastNonce, key: lastKey} = await generateNewKey({ chatId, persistence });

  if (lastNonce > nonce) {
    throw new Error("Cannot generate key backwards: from " + nonce + " to " + lastNonce);
  }

  while (lastNonce < nonce) {
    lastKey = await deriveNextKey({ key: lastKey });
    lastNonce++;
  }

  return lastKey;
}

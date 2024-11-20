import {
  arrayBufferToBase64,
  arrayBufferToString,
  base64ToArrayBuffer,
  stringToArrayBuffer
} from "@/crypto/string-to-base64.ts";

export const crypto = window.crypto.subtle;

const aesOptions = {
  name: "AES-GCM",
  length: 256
};

const hmacOptions = {
  name: "HMAC",
  hash: "SHA-256"
};


export async function randomAESKey(): Promise<string> {
  const key: CryptoKey = await crypto.generateKey(aesOptions, true, ["encrypt", "decrypt"]);
  const buffer = await crypto.exportKey("raw", key);
  return arrayBufferToBase64(buffer);
}

export function importCryptoKey(
  key: string,
  algorithm: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams | HmacImportParams | AesKeyAlgorithm,
  ...usages: KeyUsage[]
): Promise<CryptoKey> {
  return crypto.importKey(
    "raw",
    base64ToArrayBuffer(key),
    algorithm,
    false,
    usages
  )
}

export async function decryptAes256(
  options: {
    encrypted: string;
    iv: string;
    key: string;
  }
): Promise<{ string: string }> {
  const { encrypted, iv, key } = options;
  const importedKey = await importCryptoKey(key, aesOptions, "decrypt");

  const decrypted = await crypto.decrypt(
    {
      iv: base64ToArrayBuffer(iv),
      ...aesOptions
    },
    importedKey,
    base64ToArrayBuffer(encrypted)
  )

  return {
    string: arrayBufferToString(decrypted)
  }
}


export async function encryptAes256(
  options: {
    data: string;
    key: string;
  }
): Promise<{
  encrypted: string;
  iv: string;
}> {
  const { data, key } = options;

  const importedKey = await importCryptoKey(key, aesOptions, "encrypt");
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.encrypt(
    {
      iv: iv,
      ...aesOptions
    },
    importedKey,
    stringToArrayBuffer(data)
  )

  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv)
  }
}

export async function hmacSha256(
  {data, key}: {
    data: string;
    key: string;
  }
): Promise<string> {
  const importedKey = await importCryptoKey(key, hmacOptions, "sign");
  const signature = await crypto.sign(hmacOptions, importedKey, stringToArrayBuffer(data));
  return arrayBufferToBase64(signature);
}

export async function verifyHmacSha256(
  {data, key, signature}: {
    data: string;
    key: string;
    signature: string;
  }
): Promise<boolean> {
  const importedKey = await importCryptoKey(key, hmacOptions, "verify");
  return await crypto.verify(hmacOptions, importedKey, base64ToArrayBuffer(signature), stringToArrayBuffer(data));
}

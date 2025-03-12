import { arrayBufferToBase64, arrayBufferToString, base64ToArrayBuffer, stringToArrayBuffer } from "./base-64";

export const crypto = window.crypto.subtle;

export const aesOptions = {
  name: "AES-GCM",
  length: 256,
};

export const hmacOptions = {
  name: "HMAC",
  hash: "SHA-256",
};

export const rsa4096Options = {
  name: "RSA-OAEP",
  modulusLength: 4096,
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
  hash: "SHA-512",
};

export async function randomAESKey(): Promise<string> {
  const key: CryptoKey = await crypto.generateKey(aesOptions, true, ["encrypt", "decrypt"]);
  return exportRawCryptoKey(key);
}

export async function exportRawCryptoKey(
  key: CryptoKey,
): Promise<string> {
  const buffer = await crypto.exportKey("raw", key);
  return arrayBufferToBase64(buffer);
}

export function importRawCryptoKey(
  key: string,
  algorithm: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams | HmacImportParams | AesKeyAlgorithm,
  ...usages: KeyUsage[]
): Promise<CryptoKey> {
  return crypto.importKey(
    "raw",
    base64ToArrayBuffer(key),
    algorithm,
    false,
    usages,
  );
}

export async function decryptAes256(
  options: {
    encrypted: string;
    iv: string;
    key: string;
  },
): Promise<{ string: string } | undefined> {
  const { encrypted, iv, key } = options;
  const importedKey = await importRawCryptoKey(key, aesOptions, "decrypt");

  try {
    const decrypted = await crypto.decrypt(
      {
        iv: base64ToArrayBuffer(iv),
        ...aesOptions,
      },
      importedKey,
      base64ToArrayBuffer(encrypted),
    );

    return {
      string: arrayBufferToString(decrypted),
    };
  } catch (_) {
    return undefined;
  }
}


export async function encryptAes256(
  options: {
    data: string;
    key: string;
  },
): Promise<{
  encrypted: string;
  iv: string;
}> {
  const { data, key } = options;

  const importedKey = await importRawCryptoKey(key, aesOptions, "encrypt");
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.encrypt(
    {
      iv: iv,
      ...aesOptions,
    },
    importedKey,
    stringToArrayBuffer(data),
  );

  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
  };
}

export async function hmacSha256(
  { data, key }: {
    data: string;
    key: string;
  },
): Promise<string> {
  const importedKey = await importRawCryptoKey(key, hmacOptions, "sign");
  const signature = await crypto.sign(hmacOptions, importedKey, stringToArrayBuffer(data));
  return arrayBufferToBase64(signature);
}

export async function verifyHmacSha256(
  { data, key, signature }: {
    data: string;
    key: string;
    signature: string;
  },
): Promise<boolean> {
  const importedKey = await importRawCryptoKey(key, hmacOptions, "verify");
  return await crypto.verify(hmacOptions, importedKey, base64ToArrayBuffer(signature), stringToArrayBuffer(data));
}

export type RSAKeyPair = {
  publicKey: string;
  privateKey: string;
}

export async function randomRSA4096KeyPair(): Promise<RSAKeyPair> {
  const { privateKey, publicKey } = await crypto.generateKey(
    rsa4096Options,
    true,
    ["encrypt", "decrypt"],
  );
  const privateKeyBytes = await crypto.exportKey("pkcs8", privateKey);
  const publicKeyBytes = await crypto.exportKey("spki", publicKey);
  const privateKeyString = arrayBufferToBase64(privateKeyBytes);
  const publicKeyString = arrayBufferToBase64(publicKeyBytes);
  return {
    privateKey: privateKeyString,
    publicKey: publicKeyString,
  };
}

export type EncryptRSA4096Options = {
  publicKey: string;
  data: string;
}

export async function encryptRSA4096(
  { publicKey, data }: EncryptRSA4096Options,
): Promise<string> {
  const dataBuffer = stringToArrayBuffer(data);
  const publicKeyBuffer = base64ToArrayBuffer(publicKey);
  const importedKey = await crypto.importKey(
    "spki",
    publicKeyBuffer,
    rsa4096Options,
    true,
    ["encrypt"],
  );
  const result = await crypto.encrypt(rsa4096Options, importedKey, dataBuffer);
  return arrayBufferToBase64(result);
}

export type DecryptRSA4096Options = {
  privateKey: string;
  base64: string;
}

export async function decryptRSA4096(
  { privateKey, base64 }: DecryptRSA4096Options,
): Promise<string> {
  const keyDataBuffer = base64ToArrayBuffer(privateKey);
  const importedKey = await crypto.importKey(
    "pkcs8",
    keyDataBuffer,
    rsa4096Options,
    true,
    ["decrypt"],
  );

  const dataBuffer = base64ToArrayBuffer(base64);

  const result = await crypto.decrypt(rsa4096Options, importedKey, dataBuffer);
  return arrayBufferToString(result);
}


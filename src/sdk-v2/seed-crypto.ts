import { decryptAes256, encryptAes256, hmacSha256, verifyHmacSha256 } from "./crypto/subtle-crypto";

export interface DecryptContentOptions {
  content: string;
  contentIV: string;
  signature: string;
  key: string;
}

export async function decryptContent({ content, contentIV, signature, key }: DecryptContentOptions): Promise<unknown> {
  // Decrypt content
  const decryptedJSON = await decryptAes256({
    encrypted: content,
    iv: contentIV,
    key: key,
  });

  if (!decryptedJSON) {
    return;
  }

  // Check that message-content is signed
  const verify = await verifyHmacSha256({
    data: "SIGNATURE:" + decryptedJSON.string,
    key: key,
    signature: signature,
  });

  if (!verify) {
    return;
  }

  return JSON.parse(decryptedJSON.string);
}

export interface DeriveNextKeyOptions {
  key: string;
}

export function deriveNextKey({ key }: DeriveNextKeyOptions): Promise<string> {
  return hmacSha256({
    data: "NEXT-KEY",
    key: key,
  });
}

export interface EncryptContentOptions {
  content: unknown;
  key: string;
}

export interface EncryptContentResult {
  contentIV: string;
  content: string;
  signature: string;
}

export async function encryptContent(
  { content, key }: EncryptContentOptions,
): Promise<EncryptContentResult> {
  const contentString = JSON.stringify(content);

  const signature = await hmacSha256({
    data: "SIGNATURE:" + contentString,
    key: key,
  });

  const encryptedContent = await encryptAes256({
    data: contentString,
    key: key,
  });

  return {
    contentIV: encryptedContent.iv,
    content: encryptedContent.encrypted,
    signature: signature,
  };
}


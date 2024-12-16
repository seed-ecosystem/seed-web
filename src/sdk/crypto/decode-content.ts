import {decryptAes256, verifyHmacSha256} from "@/sdk/crypto/subtle-crypto.ts";

export interface DecodeContentOptions {
  content: string;
  contentIV: string;
  signature: string;
  key: string;
}

export async function decodeContent({content, contentIV, signature, key}: DecodeContentOptions): Promise<unknown | undefined> {
  // Decrypt content
  const decryptedJSON = await decryptAes256({
    encrypted: content,
    iv: contentIV,
    key: key,
  });

  if (!decryptedJSON) return;

  // Check that message-content is signed
  const verify = await verifyHmacSha256({
    data: "SIGNATURE:" + decryptedJSON.string,
    key: key,
    signature: signature
  });

  if (!verify) return;

  return JSON.parse(decryptedJSON.string);
}

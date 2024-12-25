import {decryptAes256, verifyHmacSha256} from "@/sdk/crypto/subtle-crypto.ts";

export interface DecryptContentOptions {
  content: string;
  contentIV: string;
  signature: string;
  key: string;
}

export async function decryptContent({content, contentIV, signature, key}: DecryptContentOptions): Promise<unknown> {
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

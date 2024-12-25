import {encryptAes256, hmacSha256} from "@/sdk/crypto/subtle-crypto.ts";

export interface EncryptContentOptions {
  content: unknown;
  key: string;
}

export interface EncryptContentResult {
  contentIV: string;
  content: string;
  signature: string;
}

export async function encryptContent({ content, key }: EncryptContentOptions): Promise<EncryptContentResult> {
  const contentString = JSON.stringify(content);

  const signature = await hmacSha256({
    data: "SIGNATURE:" + contentString,
    key: key
  });

  const encryptedContent = await encryptAes256({
    data: contentString,
    key: key
  });

  return {
    contentIV: encryptedContent.iv,
    content: encryptedContent.encrypted,
    signature: signature
  };
}

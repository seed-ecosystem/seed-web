import {MessageCoder} from "@/crypto/message-coder.ts";
import {MessageContent} from "@/crypto/message/content/message-content.ts";
import {decryptAes256, encryptAes256, hmacSha256, verifyHmacSha256} from "@/crypto/subtle-crypto.ts";

export function createMessageCoder(): MessageCoder {
  return {
    async decode({ content, contentIV, signature, key }) {

      // Decrypt content
      const decryptedJSON = await decryptAes256({
        encrypted: content,
        iv: contentIV,
        key: key,
      });

      if (!decryptedJSON) return null;

      // Check that message is signed
      const verify = await verifyHmacSha256({
        data: "SIGNATURE:" + decryptedJSON.string,
        key: key,
        signature: signature
      });

      if (!verify) return null;

      return JSON.parse(decryptedJSON.string) as MessageContent;
    },

    async encode({ content, key }) {
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
    },

    deriveNextKey(key: string): Promise<string> {
      return hmacSha256({
        data: "NEXT-KEY",
        key: key
      });
    },
  }
}

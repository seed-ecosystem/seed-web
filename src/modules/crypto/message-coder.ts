import {MessageContent} from "@/modules/crypto/message-content/message-content.ts";
import {decryptAes256, encryptAes256, hmacSha256, verifyHmacSha256} from "@/modules/crypto/subtle-crypto.ts";
import typia from "typia";

export interface MessageCoder {
  decode(options: {
    content: string;
    contentIV: string;
    signature: string;
    key: string;
  }): Promise<MessageContent | undefined>;

  encode(options: {
    content: MessageContent;
    key: string;
  }): Promise<{
    content: string;
    contentIV: string;
    signature: string;
  }>;

  deriveNextKey(key: string): Promise<string>;
}

export function createMessageCoder(): MessageCoder {
  return {
    async decode({ content, contentIV, signature, key }) {

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

      const json = JSON.parse(decryptedJSON.string)

      if (!typia.is<MessageContent>(json)) return;

      return json;
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

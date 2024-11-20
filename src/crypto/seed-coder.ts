import {MessageContent} from "@/crypto/message/content/message-content.ts";
import {Message} from "@/api/message/message.ts";

export interface SeedCoder {
  decode(options: {
    content: string;
    contentIV: string;
    signature: string;
    key: string;
  }): Promise<MessageContent | null>;

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

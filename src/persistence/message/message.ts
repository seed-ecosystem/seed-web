import {MessageContent} from "@/crypto/message/content/message-content.ts";

export interface Message {
  nonce: number;
  chatId: string;
  key: string;
  content: MessageContent | { type: "deferred" };
}

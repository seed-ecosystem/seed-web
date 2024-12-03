import {MessageContent} from "@/modules/crypto/message-content/message-content.ts";

export interface ChatMessage {
  nonce: number;
  chatId: string;
  key: string;
  content: MessageContent | { type: "deferred" };
}

import {Chat} from "@/persistence/chat/chat.ts";
import {MessageContent} from "@/crypto/message/content/message-content.ts";

export interface Message {
  nonce: number;
  chat: Chat;
  content: MessageContent
  key: string;
}

import {MessageContent} from "@/crypto/message/content/message-content.ts";

export interface Message {
  nonce: {
    server: number;
  } | {
    local: number; // message is loading
  };
  isAuthor: boolean;
  isSending: boolean; // might be true only if isAuthor is true
  content: MessageContent;
}

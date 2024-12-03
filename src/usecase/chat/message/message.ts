import {MessageContent} from "@/modules/crypto/message-content/message-content.ts";

export interface Message {
  nonce: {
    server: number;
  } | {
    local: number; // message-content is loading
  };
  isAuthor: boolean;
  isSending: boolean; // might be true only if isAuthor is true
  isFailure: boolean;
  content: MessageContent;
}

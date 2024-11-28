import {MessageContent} from "@/crypto/message/content/message-content.ts";

export interface SanitizeContentUsecase {
  (content: any): MessageContent | undefined
}

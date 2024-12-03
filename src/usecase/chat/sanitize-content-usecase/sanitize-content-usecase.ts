import {MessageContent} from "@/modules/crypto/message-content/message-content.ts";

export interface SanitizeContentUsecase {
  (content: any): MessageContent | undefined
}

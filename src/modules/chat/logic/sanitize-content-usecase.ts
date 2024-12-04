import {MessageContent} from "@/modules/chat/logic/message.ts";

export interface SanitizeContentUsecase {
  (content: MessageContent): MessageContent
}

export function createSanitizeContentUsecase(): SanitizeContentUsecase {
  return (content) => {
    if (content.type == "regular") {
      const text = content.text.length > 4096 ? `${content.text.substring(0, 4096)}...` : content.text;
      const title = content.title.length > 25 ? `${content.title.substring(0, 25)}...` : content.title;

      return {
        ...content,
        text: text,
        title: title,
      };
    }

    return content;
  }
}

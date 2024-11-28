import {SanitizeContentUsecase} from "@/usecase/chat/sanitize-content-usecase/sanitize-content-usecase.ts";
import typia from "typia";
import {MessageContent} from "@/crypto/message/content/message-content.ts";

export function createSanitizeContentUsecase(): SanitizeContentUsecase {
  return (content) => {
    if (!typia.is<MessageContent>(content)) {
      return;
    }

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

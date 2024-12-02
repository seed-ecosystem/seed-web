import {GetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/get-message-key-usecase.ts";
import {MessageContent} from "@/modules/crypto/message-content/message-content.ts";
import {MessageCoder} from "@/modules/crypto/message-coder.ts";
import {SanitizeContentUsecase} from "@/usecase/chat/sanitize-content-usecase/sanitize-content-usecase.ts";
import {GetNicknameUsecase} from "@/usecase/chat/nickname/get-nickname-usecase.ts";
import {Message as ApiMessage} from "@/modules/socket/message/message.ts";
import {Message} from "@/usecase/chat/message/message.ts";

export interface DecodeMessageUsecase {
  (message: ApiMessage): Promise<Message & { nonce: { server: number }, key: string }>;
}

export function createDecodeMessagesUsecase(
  {getMessageKey, coder, sanitizeContent, getNickname}: {
    getMessageKey: GetMessageKeyUsecase;
    coder: MessageCoder;
    sanitizeContent: SanitizeContentUsecase;
    getNickname: GetNicknameUsecase;
  }
): DecodeMessageUsecase {
  return async (message) => {
    const key = await getMessageKey(message.nonce);

    if (!key) throw new Error("Can't get message-content key");

    let content: MessageContent | undefined | null = await coder.decode({
      content: message.content,
      contentIV: message.contentIV,
      signature: message.signature,
      key: key
    });

    content = sanitizeContent(content);

    const common = {
      nonce: {
        server: message.nonce
      },
      isSending: false,
      isFailure: false,
      key: key
    };

    if (content?.type == "regular") {
      const nickname = getNickname();

      return {
        content: content,
        isAuthor: nickname == content.title,
        display: true,
        ...common
      };
    } else {
      return {
        isAuthor: false,
        content: { type: "unknown" },
        display: false,
        ...common
      };
    }
  };
}

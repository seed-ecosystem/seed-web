import {GetHistoryUsecase} from "@/usecase/chat/get-history-usecase/get-history-usecase.ts";
import {GetHistoryRequest, GetHistoryResponse} from "@/api/request/get-history-request.ts";
import {SeedSocket} from "@/api/seed-socket.ts";
import {MessageCoder} from "@/crypto/message-coder.ts";
import {Chat} from "@/persistence/chat/chat.ts";
import {GetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/get-message-key-usecase.ts";
import {MessageContent} from "@/crypto/message/content/message-content.ts";
import {SanitizeContentUsecase} from "@/usecase/chat/sanitize-content-usecase/sanitize-content-usecase.ts";
import {Message} from "@/usecase/chat/message/message.ts";
import {GetNicknameUsecase} from "@/usecase/chat/nickname/get-nickname-usecase.ts";

export function createGetHistoryUsecase(
  { socket, coder, chat, getMessageKey, sanitizeContent, getNickname }: {
    socket: SeedSocket;
    coder: MessageCoder;
    chat: Chat;
    getMessageKey: GetMessageKeyUsecase;
    sanitizeContent: SanitizeContentUsecase;
    getNickname: GetNicknameUsecase;
  },
): GetHistoryUsecase {
  return async ({nonce, amount}) => {
    const request: GetHistoryRequest = {
      type: "history",
      nonce: nonce,
      amount: amount,
      chatId: chat.chatId,
    }

    const response: GetHistoryResponse = await socket.execute(request);

    const result: (Message & { nonce: { server: number } })[] = [];

    for (let message of (response.messages ?? [])) {
      const key = await getMessageKey(message.nonce);
      if (!key) throw new Error("Can't get message key");

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
        // todo: later reflect nickname changes
        isSending: false,
        isFailure: false,
      };

      if (content?.type == "regular") {
        const nickname = getNickname();

        result.push({
          content: content,
          isAuthor: nickname == content.title,
          ...common
        });
      } else {
        result.push({
          isAuthor: false,
          content: {
            type: "unknown"
          },
          ...common
        });
      }
    }

    return result;
  };
}

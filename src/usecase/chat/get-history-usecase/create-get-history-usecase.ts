import {GetHistoryUsecase} from "@/usecase/chat/get-history-usecase/get-history-usecase.ts";
import {GetHistoryRequest, GetHistoryResponse} from "@/api/request/get-history-request.ts";
import {SeedSocket} from "@/api/seed-socket.ts";
import {MessageCoder} from "@/crypto/message-coder.ts";
import {Chat} from "@/persistence/chat/chat.ts";
import {GetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/get-message-key-usecase.ts";

export function createGetHistoryUsecase(
  { socket, coder, chat, getMessageKey }: {
    socket: SeedSocket;
    coder: MessageCoder;
    chat: Chat;
    getMessageKey: GetMessageKeyUsecase;
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

    const result = [];

    for (let message of (response.messages ?? [])) {
      const key = await getMessageKey(message.nonce);
      if (!key) throw new Error("Can't get message key");

      const content = await coder.decode({
        content: message.content,
        contentIV: message.contentIV,
        signature: message.signature,
        key: key
      });

      result.push({
        nonce: {
          server: message.nonce
        },
        isAuthor: false, // todo: later differentiate by nickname
        isSending: false,
        content: content
      })
    }

    return result;
  };
}

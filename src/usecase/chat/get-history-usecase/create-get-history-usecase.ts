import {GetHistoryUsecase} from "@/usecase/chat/get-history-usecase/get-history-usecase.ts";
import {GetHistoryRequest, GetHistoryResponse} from "@/api/request/get-history-request.ts";
import {SeedSocket} from "@/api/seed-socket.ts";
import {MessageCoder} from "@/crypto/message-coder.ts";
import {MessageStorage} from "@/persistence/message/message-storage.ts";
import {Chat} from "@/persistence/chat/chat.ts";
import {ChatStorage} from "@/persistence/chat/chat-storage.ts";

export function createGetHistoryUsecase(
  { socket, messageCoder, messageStorage, chatStorage, chat }: {
    socket: SeedSocket;
    messageCoder: MessageCoder;
    messageStorage: MessageStorage;
    chatStorage: ChatStorage;
    chat: Chat;
  },
): GetHistoryUsecase {
  return async ({fromNonce, amount}) => {
    const request: GetHistoryRequest = {
      amount: amount,
      fromNonce: fromNonce,
      type: "history"
    }

    const response: GetHistoryResponse = await socket.execute(request);
    const lastMessage = await messageStorage.lastMessage(chat);
    let key = lastMessage?.key;

    const result = [];

    for (let message of response.messages) {
      if (key == null) {
        key = await chatStorage.getInitialKey(chat);
      } else {
        key = await messageCoder.deriveNextKey(key);
      }

      const content = await messageCoder.decode({
        content: message.content,
        contentIV: message.contentIV,
        signature: message.signature,
        key: key
      });

      await messageStorage.add({
        chat: chat,
        key: key,
        nonce: message.nonce,
        content: content,
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

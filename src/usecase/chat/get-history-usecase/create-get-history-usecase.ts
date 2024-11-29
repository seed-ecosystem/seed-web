import {GetHistoryUsecase} from "@/usecase/chat/get-history-usecase/get-history-usecase.ts";
import {GetHistoryRequest, GetHistoryResponse} from "@/api/request/get-history-request.ts";
import {SeedSocket} from "@/api/seed-socket.ts";
import {Chat} from "@/persistence/chat/chat.ts";
import {Message} from "@/usecase/chat/message/message.ts";
import {DecodeMessageUsecase} from "@/usecase/chat/decode-messages-usecase/decode-message-usecase.ts";

export function createGetHistoryUsecase(
  {socket, chat, decodeMessage}: {
    socket: SeedSocket;
    chat: Chat;
    decodeMessage: DecodeMessageUsecase;
  },
): GetHistoryUsecase {
  return async ({nonce, amount}) => {
    const request: GetHistoryRequest = {
      type: "history",
      nonce: nonce,
      amount: amount,
      chatId: chat.chatId,
    }

    const response: GetHistoryResponse = await socket.execute(request) ?? [];

    const result: (Message & { nonce: { server: number } })[] = [];

    for (let message of (response.messages ?? [])) {
      result.push(await decodeMessage(message));
    }

    return result;
  };
}

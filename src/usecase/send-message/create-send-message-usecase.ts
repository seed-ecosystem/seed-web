import {SendMessageUsecase} from "@/usecase/send-message/send-message-usecase.ts";

export function createSendMessageUsecase(): SendMessageUsecase {
  return (
    text: string,
    previousMessageId: string | null,
    chatId: string,
  ): Promise<void> => {
    return Promise.resolve()
  }
}

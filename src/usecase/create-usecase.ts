import {Usecase} from "@/usecase/usecase.ts";
import {createSendMessageUsecase} from "@/usecase/chat/send-message/create-send-message-usecase.ts";

export function createUsecase(): Usecase {
  return {
    sendMessage: createSendMessageUsecase()
  }
}

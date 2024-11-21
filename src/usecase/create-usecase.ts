import {Usecase} from "@/usecase/usecase.ts";
import {createSendMessageUsecase} from "@/usecase/send-message/create-send-message-usecase.ts";

export function createUsecase(): Usecase {
  return {
    sendMessage: createSendMessageUsecase()
  }
}

import {SeedLayer3} from "@/usecase/seed-layer3.ts";
import {createSendMessageUsecase} from "@/usecase/send-message/create-send-message-usecase.ts";

export function createSeedLayer3(): SeedLayer3 {
  return {
    sendMessageUsecase: createSendMessageUsecase()
  }
}

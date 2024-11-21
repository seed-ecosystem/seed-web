import {SendMessageUsecase} from "@/usecase/send-message/send-message-usecase.ts";

export interface Usecase {
  sendMessage: SendMessageUsecase;
}

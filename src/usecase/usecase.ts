import {SendMessageUsecase} from "@/usecase/chat/send-message/send-message-usecase.ts";

export interface Usecase {
  sendMessage: SendMessageUsecase;
}

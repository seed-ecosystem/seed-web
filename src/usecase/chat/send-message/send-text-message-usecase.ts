import {GetNicknameUsecase} from "@/usecase/chat/nickname/get-nickname-usecase.ts";
import {SendMessageUsecase} from "@/usecase/chat/send-message/send-message-usecase.ts";
import {EventBus} from "@/usecase/chat/event-bus/event-bus.ts";

export interface SendTextMessageUsecase {
  (
    options: {
      text: string;
    }
  ): void;
}

export function createSendTextMessageUsecase(
  {nickname, sendMessage, events}: {
    nickname: GetNicknameUsecase;
    sendMessage: SendMessageUsecase;
    events: EventBus;
  }
): SendTextMessageUsecase {
  return ({text}) => {
    events.emit({
      type: "reset_text"
    });
    sendMessage({
      content: {
        type: "regular",
        title: nickname(),
        text: text,
      }
    });
  };
}

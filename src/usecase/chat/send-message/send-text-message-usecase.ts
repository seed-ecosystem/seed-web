import {GetNicknameUsecase} from "@/usecase/chat/nickname/get-nickname-usecase.ts";
import {SendMessageUsecase} from "@/usecase/chat/send-message/send-message-usecase.ts";

export interface SendTextMessageUsecase {
  (
    options: {
      text: string;
    }
  ): void;
}

export function createSendTextMessageUsecase(
  {nickname, sendMessage}: {
    nickname: GetNicknameUsecase;
    sendMessage: SendMessageUsecase;
  }
): SendTextMessageUsecase {
  return ({text}) => {
    sendMessage({
      content: {
        type: "regular",
        title: nickname(),
        text: text,
      }
    });
  };
}

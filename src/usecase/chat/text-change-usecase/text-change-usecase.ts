import {SendTextMessageUsecase} from "@/usecase/chat/send-message/send-text-message-usecase.ts";
import {Chat} from "@/deprecated-persistence/chat/chat.ts";
import {GetNicknameUsecase} from "@/usecase/chat/nickname/get-nickname-usecase.ts";
import {SendMessageUsecase} from "@/usecase/chat/send-message/send-message-usecase.ts";

export interface TextChangeUsecase {
  (text: string): void;
}

export function createTextChangeUsecase(
  {nickname, sendMessage}: {
    nickname: GetNicknameUsecase,
    sendMessage: SendMessageUsecase;
  }
): TextChangeUsecase {
  const lastMillisTypingSent = Date.now();

  return (text) => {
    if (Date.now() - lastMillisTypingSent < 5_000) return;
    // sendMessage({
    //   content: {
    //     type: "regular"
    //   }
    // });
  };
}

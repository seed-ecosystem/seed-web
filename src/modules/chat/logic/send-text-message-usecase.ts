import {SendMessageEvent, SendMessageUsecase} from "@/modules/chat/logic/send-message-usecase.ts";
import {Channel} from "@/modules/coroutines/channel.ts";
import {MutableRefObject, RefObject} from "react";

export interface SendTextMessageUsecase {
  (options: {
    text: string;
    localNonceRef: MutableRefObject<number>;
    serverNonceRef: MutableRefObject<number>;
    nicknameRef: RefObject<string>;
  }): Channel<SendMessageEvent>;
}

export function createSendTextMessageUsecase(
  {sendMessage}: {
    sendMessage: SendMessageUsecase
  }
): SendTextMessageUsecase {
  return ({text, localNonceRef, serverNonceRef, nicknameRef}) => sendMessage({
    content: {
      type: "regular",
      author: true,
      title: nicknameRef.current!,
      text: text,
    },
    localNonceRef,
    serverNonceRef
  });
}

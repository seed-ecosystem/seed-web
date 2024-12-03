import {ChangeNicknameUsecase, createChangeNicknameUsecase} from "@/modules/chat/logic/change-nickname-usecase.ts";
import {GetNicknameUsecase} from "@/usecase/chat/nickname/get-nickname-usecase.ts";
import {SendMessageUsecase} from "@/modules/chat/logic/send-message-usecase.ts";
import {ChatEventsUsecase, createChatEventsUsecase} from "@/modules/chat/logic/chat-events-usecase.ts";
import {Persistence} from "@/modules/umbrella/persistence/persistence.ts";
import {DecodeMessageUsecase} from "@/modules/chat/logic/decode-message-usecase.ts";
import {SeedSocket} from "@/modules/socket/seed-socket.ts";

export interface ChatLogic {
  changeNickname: ChangeNicknameUsecase;
  getNickname: GetNicknameUsecase;
  sendMessage: SendMessageUsecase;
  chatEvents: ChatEventsUsecase;
}

export function createChatLogic(
  {
    nickname: nicknameStorage,
    socket,
  }: Persistence & {
    socket: SeedSocket;
  },
): ChatLogic {
  const decodeMessage: DecodeMessageUsecase = null;

  return {
    changeNickname: createChangeNicknameUsecase({nicknameStorage}),
    chatEvents: createChatEventsUsecase({decodeMessage, socket}),
    getNickname: undefined,
    sendMessage: undefined
  }
}

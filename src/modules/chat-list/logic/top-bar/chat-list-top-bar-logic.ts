import {Channel} from "@/modules/coroutines/channel/channel.ts";
import {createChannel} from "@/modules/coroutines/channel/create.ts";
import {NicknameStateHandle} from "@/modules/main/logic/nickname-state-handle.ts";

export type ChatListTopBarEvent = {
  type: "nickname";
  value: string;
};

export interface ChatListTopBarLogic {
  events: Channel<ChatListTopBarEvent>;

  getNickname(): string;
  setNickname(value: string): void;
}

export function createChatListTopBarLogic(
  {nickname}: {
    nickname: NicknameStateHandle;
  }
): ChatListTopBarLogic {
  const events: Channel<ChatListTopBarEvent> = createChannel();

  nickname.updates.subscribe(update => events.send({ type: "nickname", value: update }));

  return {
    events,
    getNickname: nickname.get,
    setNickname: nickname.set
  };
}

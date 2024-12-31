import {NicknameStateHandle} from "@/modules/main/logic/nickname-state-handle.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";

export type ChatListTopBarEvent = {
  type: "nickname";
  value: string;
};

export interface ChatListTopBarLogic {
  events: Observable<ChatListTopBarEvent>;

  getNickname(): string;
  setNickname(value: string): void;
}

export function createChatListTopBarLogic(
  {nickname}: {
    nickname: NicknameStateHandle;
  }
): ChatListTopBarLogic {
  const events: Observable<ChatListTopBarEvent> = createObservable();

  nickname.updates.subscribe(update => events.emit({ type: "nickname", value: update }));

  return {
    events,
    getNickname: nickname.get,
    setNickname: nickname.set
  };
}

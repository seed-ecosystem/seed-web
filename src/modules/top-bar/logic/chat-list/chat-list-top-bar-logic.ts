import {NicknameStateHandle} from "@/modules/main/logic/nickname-state-handle.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";

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
  {nicknameStateHandle}: {
    nicknameStateHandle: NicknameStateHandle;
  }
): ChatListTopBarLogic {
  const events: Observable<ChatListTopBarEvent> = createObservable();

  nicknameStateHandle.updates.subscribe(value => events.emit({type: "nickname", value}));

  return {
    events,
    getNickname: nicknameStateHandle.get,
    setNickname: nicknameStateHandle.set,
  };
}

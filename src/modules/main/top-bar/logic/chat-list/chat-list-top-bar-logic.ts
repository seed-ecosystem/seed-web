import { NicknameStateHandle } from "@/modules/main/logic/nickname-state-handle.ts";
import { createObservable, Observable } from "@/coroutines/observable.ts";
import { NewStateHandle } from "@/modules/main/logic/new-state-handle.ts";

export type ChatListTopBarEvent = {
  type: "nickname";
  value: string;
};

export interface ChatListTopBarLogic {
  events: Observable<ChatListTopBarEvent>;

  getNickname(): string;
  setNickname(value: string): void;

  showNew(): void;
}

export function createChatListTopBarLogic(
  { nicknameStateHandle, newStateHandle }: {
    nicknameStateHandle: NicknameStateHandle;
    newStateHandle: NewStateHandle;
  },
): ChatListTopBarLogic {
  const events: Observable<ChatListTopBarEvent> = createObservable();

  nicknameStateHandle.updates.subscribe(value => { events.emit({ type: "nickname", value }); });

  return {
    events,
    getNickname: () => nicknameStateHandle.get(),
    setNickname: (value) => { nicknameStateHandle.set(value); },
    showNew: () => { newStateHandle.setShown(true); },
  };
}

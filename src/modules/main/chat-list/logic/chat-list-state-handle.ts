import {createObservable, Observable} from "@/coroutines/observable.ts";
import {Chat} from "@/modules/main/chat-list/logic/chat.ts";

export interface ChatListStateHandle {
  updates: Observable<Chat[]>;
  get(): Chat[];
  set(value: Chat[]): void;
}

export function createChatListStateHandle(): ChatListStateHandle {
  const updates: Observable<Chat[]> = createObservable();

  let chatList: Chat[] = [];

  function setChatList(value: Chat[]) {
    chatList = value;
    updates.emit(value);
  }

  return {
    updates,
    get: () => chatList,
    set: setChatList,
  };
}

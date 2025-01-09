import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {Chat} from "@/modules/main/chat-list/logic/chat.ts";
import {loadLocalChats} from "@/modules/main/chat-list/logic/load-local-chats.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";

export type ChatListEvent = {
  type: "chats";
  value: Chat[];
}

export interface ChatListLogic {
  events: Observable<ChatListEvent>;

  getChats(): Chat[];
}

export function createChatListLogic(
  {persistence}: {
    persistence: SeedPersistence;
  }
): ChatListLogic {
  const events = createObservable<ChatListEvent>();

  let chats: Chat[] = [];

  function setChats(value: Chat[]) {
    chats = value;
    events.emit({ type: "chats", value: chats });
  }

  loadLocalChats({persistence}).then(setChats);

  return {
    events,
    getChats: () => chats,
  };
}

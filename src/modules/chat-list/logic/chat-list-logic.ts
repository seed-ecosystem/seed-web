import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {Chat} from "@/modules/chat-list/logic/chat.ts";
import {loadLocalChats} from "@/modules/chat-list/logic/load-local-chats.ts";
import {
  ChatListTopBarLogic,
  createChatListTopBarLogic
} from "@/modules/chat-list/logic/top-bar/chat-list-top-bar-logic.ts";
import {NicknameStateHandle} from "@/modules/main/logic/nickname-state-handle.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";

export type ChatListEvent = {
  type: "chats";
  value: Chat[];
}

export interface ChatListLogic {
  events: Observable<ChatListEvent>;

  topBar: ChatListTopBarLogic;

  getChats(): Chat[];
}

export function createChatListLogic(
  {nickname, persistence}: {
    nickname: NicknameStateHandle;
    persistence: SeedPersistence;
  }
): ChatListLogic {
  const events = createObservable<ChatListEvent>();

  let chats: Chat[] = [];

  const topBar = createChatListTopBarLogic({nickname});

  function setChats(value: Chat[]) {
    chats = value;
    events.emit({ type: "chats", value: chats });
  }

  loadLocalChats({persistence}).then(setChats);

  return {
    events,
    topBar,
    getChats: () => chats,
  };
}

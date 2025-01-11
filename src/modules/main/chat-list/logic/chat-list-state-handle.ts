import {createObservable, Observable} from "@/coroutines/observable.ts";
import {Chat} from "@/modules/main/chat-list/logic/chat.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {launch} from "@/modules/coroutines/launch.ts";

export interface ChatListStateHandle {
  updates: Observable<Chat[]>;
  get(): Chat[];
  init(chatList: Chat[]): void;
  popUp(chatId: string, lastMessage: Chat["lastMessage"]): void;
  unshift(chat: Chat): void;
  delete(chatId: string): void;
}

export function createChatListStateHandle(
  {persistence}: {
    persistence: SeedPersistence;
  }
): ChatListStateHandle {
  const updates: Observable<Chat[]> = createObservable();

  let chatList: Chat[] = [];

  function setChatList(value: Chat[]) {
    chatList = value;
    updates.emit(value);
  }

  return {
    updates,

    get: () => chatList,

    init(chatList: Chat[]) {
      setChatList(chatList);
    },

    popUp(chatId: string, lastMessage: Chat["lastMessage"]) {
      const newList = [...chatList];
      const index = chatList.findIndex(chat => chat.id === chatId);
      const [chat] = newList.splice(index, 1);
      newList.unshift({...chat, lastMessage});
      setChatList(newList);
      launch(() => persistence.chat.updateLastMessageDate(chatId, new Date()));
    },

    unshift(chat: Chat) {
      setChatList([chat, ...chatList]);
    },

    delete(chatId: string) {
      const newList = [...chatList];
      const index = chatList.findIndex(chat => chat.id === chatId);
      newList.splice(index, 1);
      setChatList(newList);
      launch(() => persistence.chat.delete(chatId));
    }
  };
}

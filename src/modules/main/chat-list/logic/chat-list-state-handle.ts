import {createObservable, Observable} from "@/coroutines/observable.ts";
import {Chat} from "@/modules/main/chat-list/logic/chat.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {ChatStateHandle} from "@/modules/main/logic/chat-state-handle.ts";

export interface ChatListStateHandle {
  updates: Observable<Chat[]>;
  get(): Chat[];
  init(chatList: Chat[]): void;
  popUp(chatId: string, lastMessage: Chat["lastMessage"]): void;
  unshift(chat: Chat): void;
  delete(chatId: string): void;
  rename(chatId: string, title: string): void;
}

export function createChatListStateHandle(
  {persistence, chatStateHandle}: {
    persistence: SeedPersistence;
    chatStateHandle: ChatStateHandle;
  }
): ChatListStateHandle {
  const updates: Observable<Chat[]> = createObservable();

  let chatList: Chat[] = [];

  function setChatList(value: Chat[]) {
    chatList = value;
    updates.emit(value);
  }

  chatStateHandle.updates.subscribe(active => {
    chatList = chatList.map(chat => combine(chat, active?.chatId));
  });

  return {
    updates,

    get: () => chatList,

    init(chatList: Chat[]) {
      chatList = chatList.map(chat => combine(chat, chatStateHandle.get()?.chatId))
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
      setChatList([combine(chat, chatStateHandle.get()?.chatId), ...chatList]);
    },

    delete(chatId: string) {
      const newList = [...chatList];
      const index = chatList.findIndex(chat => chat.id === chatId);
      newList.splice(index, 1);
      setChatList(newList);
      launch(() => persistence.chat.delete(chatId));
    },

    rename(chatId: string, title: string) {
      const newList = [...chatList];
      const index = chatList.findIndex(chat => chat.id === chatId);
      newList[index] = {
        ...newList[index],
        title: title
      };
      setChatList(newList);
      launch(() => persistence.chat.rename(chatId, title));
    }
  };
}

function combine(chat: Chat, activeChatId?: string) {
  return {
    ...chat,
    isActive: chat.id === activeChatId,
  };
}

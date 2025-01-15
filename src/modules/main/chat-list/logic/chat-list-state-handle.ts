import {createObservable, Observable} from "@/coroutines/observable.ts";
import {Chat, UiChat} from "@/modules/main/chat-list/logic/chat.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {launch} from "@/coroutines/launch.ts";
import {ChatStateHandle} from "@/modules/main/logic/chat-state-handle.ts";

export interface ChatListStateHandle {
  updates: Observable<UiChat[]>;
  get(): UiChat[];
  init(chatList: Chat[]): void;
  popUp(chatId: string, lastMessage: Chat["lastMessage"], unreadCount: number): void;
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
  const updates: Observable<UiChat[]> = createObservable();

  let chatList: UiChat[] = [];

  function setChatList(value: UiChat[]) {
    chatList = value;
    updates.emit(value);
  }

  chatStateHandle.updates.subscribe(active => {
    chatList = chatList.map(chat => combine(chat, active?.chatId));
    active && read(active.chatId);
  });

  function read(chatId: string) {
    const newList = [...chatList];
    const index = chatList.findIndex(chat => chat.id === chatId);
    const chat = newList[index];
    newList[index] = { ...chat, unreadCount: 0 };
    setChatList(newList);
    launch(() => persistence.chat.update(chatId, { unreadCount: 0 }));
  }

  return {
    updates,

    get: () => chatList,

    init(chatList: Chat[]) {
      const uiChatList = chatList.map(chat => combine(chat, chatStateHandle.get()?.chatId));
      const activeChat = chatStateHandle.get();
      activeChat && read(activeChat.chatId);
      setChatList(uiChatList);
    },

    popUp(chatId: string, lastMessage: UiChat["lastMessage"], unreadCount: number) {
      const newList = [...chatList];
      const index = chatList.findIndex(chat => chat.id === chatId);
      const [chat] = newList.splice(index, 1);
      unreadCount = chatStateHandle.get()?.chatId == chatId ? 0 : unreadCount;
      unreadCount += chat.unreadCount;
      newList.unshift({
        ...chat,
        lastMessage,
        unreadCount,
      });
      setChatList(newList);
      launch(() =>
        persistence.chat.update(
          chatId,
          {
            lastMessageDate: new Date(),
            unreadCount
          }
        )
      );
    },

    unshift(chat: Chat) {
      const uiChat = {
        ...chat,
        isActive: false,
        unreadCount: 0,
      }
      setChatList([combine(uiChat, chatStateHandle.get()?.chatId), ...chatList]);
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

function combine(chat: Chat, activeChatId?: string): UiChat {
  return {
    ...chat,
    isActive: chat.id === activeChatId,
  };
}

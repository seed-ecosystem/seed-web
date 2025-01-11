import {createObservable, Observable} from "@/coroutines/observable.ts";

export type Chat = {
  chatId: string;
  title: string;
} | undefined

export interface ChatStateHandle {
  updates: Observable<Chat>;
  set(chat: Chat): void;
  get(): Chat;
  rename(title: string): void;
}

export function createChatStateHandle(): ChatStateHandle {
  const updates: Observable<Chat> = createObservable();

  let chat: Chat;

  function setChat(value: Chat) {
    chat = value;
    updates.emit(chat);
  }

  return {
    updates,
    set: setChat,
    get: () => chat,
    rename: (title) => {
      if (!chat) return;
      setChat({ ...chat, title });
    }
  };
}

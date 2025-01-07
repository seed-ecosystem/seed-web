import {createObservable, Observable} from "@/coroutines/observable.ts";

export type Chat = {
  chatId: string;
  title: string;
} | undefined

export interface ChatStateHandle {
  updates: Observable<Chat>;
  set(chat: Chat): void;
  get(): Chat;
}

export function createChatStateHandle(): ChatStateHandle {
  const updates: Observable<Chat> = createObservable();

  let chat: Chat;

  return {
    updates,
    set(value) {
      chat = value;
      updates.emit(chat);
    },
    get: () => chat
  };
}

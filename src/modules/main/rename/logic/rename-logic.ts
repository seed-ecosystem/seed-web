import {ChatListStateHandle} from "@/modules/main/chat-list/logic/chat-list-state-handle.ts";
import {RenameStateHandle} from "@/modules/main/logic/rename-state-handle.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {ChatStateHandle} from "@/modules/main/logic/chat-state-handle.ts";

export type RenameEvent = {
  type: "title";
  value: string;
}

export interface RenameLogic {
  events: Observable<RenameEvent>;

  getTitle(): string;
  setTitle(value: string): void;

  cancel(): void;
  rename(): void;
}

export function createRenameLogic(
  {renameStateHandle, chatListStateHandle, chatStateHandle, chatId, title}: {
    renameStateHandle: RenameStateHandle;
    chatListStateHandle: ChatListStateHandle;
    chatStateHandle: ChatStateHandle;
    chatId: string;
    title: string;
  }
): RenameLogic {
  const events: Observable<RenameEvent> = createObservable();

  function setTitle(value: string): void {
    title = value;
    events.emit({ type: "title", value });
  }

  return {
    events,

    getTitle: () => title, setTitle,

    cancel: () => renameStateHandle.set({ shown: false }),
    rename: () => {
      chatListStateHandle.rename(chatId, title);
      chatStateHandle.rename(title);
      renameStateHandle.set({ shown: false });
    },
  }
}

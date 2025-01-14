import {createObservable, Observable} from "@/coroutines/observable.ts";
import {ChatStateHandle} from "@/modules/main/logic/chat-state-handle.ts";
import {ShareStateHandle} from "@/modules/main/logic/share-state-handle.ts";
import {DeleteStateHandle} from "@/modules/main/logic/delete-state-handle.ts";
import {RenameStateHandle} from "@/modules/main/logic/rename-state-handle.ts";
import {WorkerAdapter} from "@/worker/worker-adapter.ts";

export type ChatTopBarEvent = {
  type: "waiting";
  value: boolean;
}

export interface ChatTopBarLogic {
  events: Observable<ChatTopBarEvent>;

  getWaiting(): boolean;
  getTitle(): string;

  closeChat(): void;
  shareChat(): void;
  deleteChat(): void;
  renameChat(): void;
}

export function createChatTopBarLogic(
  {worker, chatStateHandle, chatId, title, shareStateHandle, deleteStateHandle, renameStateHandle}: {
    worker: WorkerAdapter;
    chatStateHandle: ChatStateHandle;
    shareStateHandle: ShareStateHandle;
    deleteStateHandle: DeleteStateHandle;
    renameStateHandle: RenameStateHandle;
    chatId: string;
    title: string;
  }
): ChatTopBarLogic {
  const events: Observable<ChatTopBarEvent> = createObservable();

  let waiting = true;

  function setWaiting(value: boolean) {
    waiting = value;
    events.emit({ type: "waiting", value });
  }

  worker.isWaiting(chatId).then(setWaiting);

  worker.events.subscribe(event => {
    switch (event.type) {
      case "waiting":
        if (chatId != event.chatId) return;
        setWaiting(event.value);
        break;
    }
  });

  return {
    events,

    getWaiting: () => waiting,
    getTitle: () => title,

    closeChat: () => chatStateHandle.set(undefined),
    shareChat: () => shareStateHandle.set({ shown: true, chatId }),
    deleteChat: () => deleteStateHandle.set({ shown: true, chatId }),
    renameChat: () => renameStateHandle.set({ shown: true, chatId, title }),
  };
}

import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {ChatStateHandle} from "@/modules/main/logic/chat-state-handle.ts";
import {ShareStateHandle} from "@/modules/main/logic/share-state-handle.ts";
import {DeleteStateHandle} from "@/modules/main/logic/delete-state-handle.ts";

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
}

export function createChatTopBarLogic(
  {worker, chatStateHandle, chatId, title, shareStateHandle, deleteStateHandle}: {
    worker: WorkerStateHandle;
    chatStateHandle: ChatStateHandle;
    shareStateHandle: ShareStateHandle;
    deleteStateHandle: DeleteStateHandle;
    chatId: string;
    title: string;
  }
): ChatTopBarLogic {
  const events: Observable<ChatTopBarEvent> = createObservable();

  worker.events.subscribe(event => {
    switch (event.type) {
      case "waiting":
        if (chatId != event.chatId) return;
        events.emit({ type: "waiting", value: event.value });
        break;
    }
  });

  return {
    events,

    getWaiting: () => worker.isWaiting(chatId),
    getTitle: () => title,

    closeChat: () => chatStateHandle.set(undefined),
    shareChat: () => shareStateHandle.set({ shown: true, chatId }),
    deleteChat: () => deleteStateHandle.set({ shown: true, chatId }),
  };
}

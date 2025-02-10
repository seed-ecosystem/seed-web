import { WorkerStateHandle } from "@/modules/umbrella/logic/worker-state-handle.ts";
import { createObservable, Observable } from "@/coroutines/observable.ts";
import { ChatStateHandle } from "@/modules/main/logic/chat-state-handle.ts";
import { ShareStateHandle } from "@/modules/main/logic/share-state-handle.ts";
import { DeleteStateHandle } from "@/modules/main/logic/delete-state-handle.ts";
import { RenameStateHandle } from "@/modules/main/logic/rename-state-handle.ts";

export type ChatTopBarEvent = {
  type: "waiting";
  value: boolean;
}

export interface ChatTopBarLogic {
  events: Observable<ChatTopBarEvent>;

  getWaiting: () => boolean;
  getTitle: () => string;

  closeChat: () => void;
  shareChat: () => void;
  deleteChat: () => void;
  renameChat: () => void;
}

export function createChatTopBarLogic(
  { worker, chatStateHandle, url, queueId, title, shareStateHandle, deleteStateHandle, renameStateHandle }: {
    worker: WorkerStateHandle;
    chatStateHandle: ChatStateHandle;
    shareStateHandle: ShareStateHandle;
    deleteStateHandle: DeleteStateHandle;
    renameStateHandle: RenameStateHandle;
    url: string,
    queueId: string;
    title: string;
  },
): ChatTopBarLogic {
  const events: Observable<ChatTopBarEvent> = createObservable();

  worker.events.subscribe(event => {
    switch (event.type) {
      case "waiting":
        if (queueId != event.queueId) return;
        events.emit({ type: "waiting", value: event.waiting });
        break;
    }
  });

  return {
    events,

    getWaiting: () => worker.getWaiting(url, queueId),
    getTitle: () => title,

    closeChat: () => { chatStateHandle.set(undefined); },
    shareChat: () => { shareStateHandle.set({ shown: true, chatId: queueId }); },
    deleteChat: () => { deleteStateHandle.set({ shown: true, chatId: queueId }); },
    renameChat: () => { renameStateHandle.set({ shown: true, chatId: queueId, title }); },
  };
}

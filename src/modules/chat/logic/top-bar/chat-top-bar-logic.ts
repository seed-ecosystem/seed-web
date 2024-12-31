import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";

export type ChatTopBarEvent = {
  type: "waiting";
  value: boolean;
}

export interface ChatTopBarLogic {
  events: Observable<ChatTopBarEvent>;

  getWaiting(): boolean;
  getTitle(): string;
}

export function createChatTopBarLogic(
  {worker, chatId, title}: {
    worker: WorkerStateHandle;
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
    getTitle: () => title
  };
}

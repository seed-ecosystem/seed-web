import {createObservable, Observable} from "@/coroutines/observable.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";

export type TopBarEvent = {
  type: "loading",
  value: boolean;
};

export interface TopBarLogic {
  events: Observable<TopBarEvent>;

  getLoading(): boolean;

  closeChat(): void;
}


export function createTopBarLogic(
  {worker, closeChat}: {
    worker: WorkerStateHandle;
    closeChat(): void;
  }
): TopBarLogic {
  const events: Observable<TopBarEvent> = createObservable();

  worker.events.subscribe(event => {
    switch (event.type) {
      case "connected":
        events.emit({ type: "loading", value: !event.value });
        break;
    }
  });

  return {
    events,
    getLoading: () => !worker.isConnected(),
    closeChat
  }
}

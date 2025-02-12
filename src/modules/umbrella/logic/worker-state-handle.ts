import { createObservable, Observable } from "@/coroutines/observable.ts";
import { SeedWorker, SeedWorkerMessage, SeedWorkerMessageContent } from "@/sdk-v2/seed-worker";
import { sanitizeContent } from "@/modules/umbrella/logic/sanitize-messages.ts";
import { SeedPersistence } from "@/modules/umbrella/persistence/seed-persistence.ts";

export type WorkStateHandleEvent = {
  type: "new";
  url: string;
  queueId: string;
  messages: SeedWorkerMessage[];
} | {
  type: "connected";
  connected: boolean;
} | {
  type: "waiting";
  url: string;
  queueId: string;
  waiting: boolean;
}

export type SendMessageOptions = {
  queueId: string;
  content: SeedWorkerMessageContent;
}

export type SubscribeOptions = {
  queueId: string;
  nonce: number;
}

export interface WorkerStateHandle {
  events: Observable<WorkStateHandleEvent>;

  getConnected(): boolean;
  getWaiting(url: string, queueId: string): boolean;

  send(url: string, options: SendMessageOptions): Promise<number | undefined>;
  subscribe(url: string, options: SubscribeOptions): void;
}

export function createWorkerStateHandle(
  { worker, persistence }: {
    worker: SeedWorker;
    persistence: SeedPersistence;
  },
): WorkerStateHandle {
  const events: Observable<WorkStateHandleEvent> = createObservable();

  worker.events.subscribeAsChannel().onEach(async event => {
    switch (event.type) {
      case "new":
        {
          const messages = event.messages.map(message => {
            return {
              ...message,
              content: sanitizeContent(message.content),
            };
          });
          await persistence.message.add(messages);
          events.emit({ ...event, messages });
        }
        break;
      case "waiting":
      case "connected":
        events.emit(event);
        break;
    }
  });

  return {
    events,
    getConnected() {
      return worker.getConnected();
    },
    getWaiting(url, queueId) {
      return worker.getWaiting(url, queueId);
    },
    send(url, { queueId, content }) {
      return worker.send(
        url,
        {
          queueId,
          content: sanitizeContent(content),
        },
      );
    },
    subscribe(url, queueId) {
      worker.subscribe(url, queueId);
    },
  };
}

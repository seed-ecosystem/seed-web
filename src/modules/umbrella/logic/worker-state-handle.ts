import {createObservable, Observable} from "@/coroutines/observable.ts";
import {Message, MessageContent} from "@/sdk/worker/message.ts";
import {SeedWorker} from "@/sdk/worker/seed-worker.ts";
import {sanitizeContent} from "@/modules/umbrella/logic/sanitize-messages.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";

export type WorkStateHandleEvent = {
  type: "new";
  queueId: string;
  messages: Message[];
} | {
  type: "connected";
  value: boolean;
} | {
  type: "waiting";
  queueId: string;
  value: boolean;
}

export type SendMessageOptions = {
  queueId: string;
  content: MessageContent;
}

export type SubscribeOptions = {
  queueId: string;
  nonce: number;
}

export interface WorkerStateHandle {
  events: Observable<WorkStateHandleEvent>;

  isConnected(): boolean;
  isWaiting(chatId: string): boolean;

  sendMessage(options: SendMessageOptions): Promise<number | undefined>;
  subscribe(options: SubscribeOptions): void;
}

export function createWorkerStateHandle(
  {worker, persistence}: {
    worker: SeedWorker;
    persistence: SeedPersistence;
  }
): WorkerStateHandle {
  const events: Observable<WorkStateHandleEvent> = createObservable();

  worker.events.subscribeAsChannel().onEach(async event => {
    switch (event.type) {
      case "new":
        const messages = event.messages.map(message => {
          return {
            ...message,
            content: sanitizeContent(message.content)
          }
        });
        await persistence.message.add(messages);
        events.emit({ ...event, messages });
        break;
      case "waiting":
      case "connected":
        events.emit(event);
        break;
    }
  });

  return {
    events,
    isConnected: worker.isConnected,
    isWaiting: worker.isWaiting,
    sendMessage: ({queueId, content}) =>
      worker.sendMessage({queueId: queueId, content: sanitizeContent(content)}),
    subscribe: worker.subscribe
  };
}

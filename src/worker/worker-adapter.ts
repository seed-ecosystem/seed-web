import SharedWorker from "@/worker/web-worker.ts?sharedworker";
import {WorkerRequest, WorkerMessage, WorkerResponse} from "@/worker/web-worker.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {Message, MessageContent} from "@/sdk/worker/message.ts";
import typia from "typia";

export type WorkerAdapterEvent = {
  type: "new";
  chatId: string;
  messages: Message[];
} | {
  type: "connected";
  value: boolean;
} | {
  type: "waiting";
  chatId: string;
  value: boolean;
}

export type SendMessageOptions = {
  chatId: string;
  content: MessageContent;
}

export type SubscribeOptions = {
  chatId: string;
  nonce: number;
}

// todo: later move here persistence
export interface WorkerAdapter {
  events: Observable<WorkerAdapterEvent>;

  isConnected(): Promise<boolean>;
  isWaiting(chatId: string): Promise<boolean>;

  sendMessage(options: SendMessageOptions): Promise<number | undefined>;
  subscribe(options: SubscribeOptions): void;
}

export function createWorkerAdapter(): WorkerAdapter {
  const worker = (new SharedWorker()).port;
  const events: Observable<WorkerAdapterEvent> = createObservable();
  const responses: Observable<WorkerResponse> = createObservable();

  worker.onmessage = (message: MessageEvent) => {
    const data = message.data;
    if (!typia.is<WorkerMessage>(data)) return;
    switch (data.type) {
      case "event":
        events.emit(data.event);
        break;
      case "response":
        responses.emit(data.response);
        break;
    }
  };

  return {
    events,

    isConnected() {
      return new Promise(resolve => {
        const id = crypto.randomUUID();
        const request: WorkerRequest = { type: "connected", id };
        worker.postMessage(request);
        const cancel = responses.subscribe(response => {
          if (response.type != "connected") return;
          if (response.id != id) return;
          resolve(response.value);
          cancel();
        });
      });
    },

    isWaiting(chatId) {
      return new Promise(resolve => {
        const id = crypto.randomUUID();
        const request: WorkerRequest = { type: "waiting", id, chatId };
        worker.postMessage(request);
        const cancel = responses.subscribe(response => {
          if (response.type != "waiting") return;
          if (response.id != id) return;
          resolve(response.value);
          cancel();
        });
      });
    },

    sendMessage({chatId, content}: SendMessageOptions): Promise<number | undefined> {
      return new Promise(resolve => {
        const id = crypto.randomUUID();
        const request: WorkerRequest = {
          type: "send",
          id, chatId, content
        };
        worker.postMessage(request);
        const cancel = responses.subscribe(event => {
          if (event.type != "send") return;
          if (event.id != id) return;
          resolve(event.value);
          cancel();
        });
      });
    },

    subscribe({chatId, nonce}: SubscribeOptions): void {
      const id = crypto.randomUUID();
      const request: WorkerRequest = {
        type: "subscribe",
        id, chatId, nonce
      };
      worker.postMessage(request);
    }
  }
}

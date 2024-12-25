import {createObservable, Observable} from "@/coroutines/observable.ts";
import {Message, MessageContent} from "@/sdk/worker/message.ts";
import {SeedWorker} from "@/sdk/worker/seed-worker.ts";
import {sanitizeContent} from "@/modules/umbrella/logic/sanitize-messages.ts";

export type WorkStateHandleEvent = {
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

export interface WorkerStateHandle {
  events: Observable<WorkStateHandleEvent>;

  isConnected(): boolean;
  isWaiting(chatId: string): boolean;

  sendMessage(options: SendMessageOptions): Promise<number | undefined>;
  subscribe(options: SubscribeOptions): void;
}

export function createWorkerStateHandle(
  {worker}: {
    worker: SeedWorker;
  }
): WorkerStateHandle {
  const events: Observable<WorkStateHandleEvent> = createObservable();
  let waitingChatIds: string[] = [];
  let accumulatedMessages: Record<string, Message[] | undefined> = {};

  worker.events.subscribe(event => {
    switch (event.type) {
      case "new":
        const message = {
          ...event.message,
          content: sanitizeContent(event.message.content),
        };
        if (waitingChatIds.includes(event.message.chatId)) {
          events.emit({
            type: "new",
            chatId: message.chatId,
            messages: [message]
          });
        } else {
          const list = accumulatedMessages[event.message.chatId] ?? [];
          list.push(message);
          accumulatedMessages[event.message.chatId] = list;
        }
        break;
      case "wait":
        const messages = accumulatedMessages[event.chatId] ?? [];
        events.emit({type: "new", chatId: event.chatId, messages});
        delete accumulatedMessages[event.chatId];
        waitingChatIds.push(event.chatId);
        events.emit({type: "waiting", chatId: event.chatId, value: true});
        break;
      case "connected":
        events.emit(event);
        if (!event.value) {
          for (const chatId of waitingChatIds) {
            events.emit({type: "waiting", chatId, value: false});
          }
          waitingChatIds = [];
          accumulatedMessages = {};
        }
        break;
    }
  });

  return {
    events,
    isConnected: worker.isConnected,
    isWaiting: (chatId) => waitingChatIds.includes(chatId),
    sendMessage: ({chatId, content}) =>
      worker.sendMessage({chatId, content: sanitizeContent(content)}),
    subscribe: worker.subscribe
  };
}

import {SeedClient} from "@/sdk/client/seed-client.ts";
import {WorkerEvent} from "@/sdk/worker/worker-event.ts";
import {MessageContent} from "@/sdk/worker/message.ts";
import {createObservable, Observable} from "@/observable/observable.ts";
import {Persistence} from "@/modules/umbrella/persistence/persistence.ts";
import {encodeContent} from "@/sdk/crypto/encode-content.ts";

export interface IsWaitingOptions {
  chatId: string;
}

export interface SendMessageOptions {
  chatId: string;
  content: MessageContent;
}

export interface SubscribeOptions {
  chatId: string;
  nonce: number;
}

export interface SeedWorker {
  isConnected: boolean;

  events: Observable<WorkerEvent>

  isWaiting(options: IsWaitingOptions): boolean;

  sendMessage(options: SendMessageOptions): Promise<void>;
  subscribe(options: SubscribeOptions): Promise<void>;
}

export function createSeedWorker(
  {client, persistence}: {
    client: SeedClient;
    persistence: Persistence;
  }
): SeedWorker {
  const events = createObservable<WorkerEvent>();

  return {
    get isConnected() {
      return client.isConnected;
    },

    events: events,

    isWaiting({ chatId }): boolean {
      return client.isWaiting({ chatId });
    },

    async sendMessage({ content }): Promise<void> {
      // todo: move encoding to the client
      const encoded = encodeContent({
        content,
        key
      });
      return Promise.resolve(undefined);
    },

    subscribe(options: { chatId: string; nonce: number }): Promise<void> {
      return Promise.resolve(undefined);
    },
  };
}

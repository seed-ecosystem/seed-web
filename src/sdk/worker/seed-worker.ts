import {SeedClient} from "@/sdk/client/seed-client.ts";
import {generateKeyAt, generateNewKey} from "@/sdk/worker/generate-key.ts";
import {encryptContent} from "@/sdk/crypto/encrypt-content.ts";
import {ClientEvent} from "@/sdk/client/client-event.ts";
import {decryptContent} from "@/sdk/crypto/decrypt-content.ts";
import {Message, MessageContent} from "@/sdk/worker/message.ts";
import typia from "typia";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {KeyPersistence} from "@/sdk/worker/key-persistence.ts";
import {IndexedKey} from "@/sdk/worker/indexed-key.ts";

export type SeedWorkerEvent = {
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
};

export type SendMessageOptions = {
  queueId: string;
  content: MessageContent;
}

export type SubscribeOptions = {
  queueId: string;
  nonce: number;
}

export interface SeedWorker {
  events: Observable<SeedWorkerEvent>;

  isConnected(): boolean;
  isWaiting(chatId: string): boolean;

  sendMessage(options: SendMessageOptions): Promise<number | undefined>;
  subscribe(options: SubscribeOptions): Promise<void>;
}

const SEND_MESSAGE_ATTEMPTS = 20;

export function createSeedWorker(
  {client, persistence}: {
    client: SeedClient;
    persistence: KeyPersistence;
  }
): SeedWorker {
  const events = createObservable<SeedWorkerEvent>();
  let accumulated: Record<string, (ClientEvent & { type: "new" })[]> = {};
  let waitingQueueIds: string[] = [];
  let subscribedQueueIds: string[] = [];

  let queueId;

  client.events.subscribeAsChannel().onEach(async (event) => {
    switch (event.type) {
      case "new":
        queueId = "chatId" in event.message ? event.message.chatId : event.message.queueId;
        if (waitingQueueIds.includes(queueId)) {
          const decrypted = await decryptNewEvents(persistence, queueId, [event]);
          events.emit(decrypted);
        } else {
          if (!(queueId in accumulated)) {
            accumulated[queueId] = [];
          }
          accumulated[queueId]!.push(event);
        }
        break;
      case "wait":
        queueId = "chatId" in event ? event.chatId : event.queueId;
        waitingQueueIds.push(queueId);
        if (queueId in accumulated) {
          const decrypted = await decryptNewEvents(persistence, queueId, accumulated[queueId]);
          delete accumulated[queueId];
          events.emit(decrypted);
        }
        events.emit({ type: "waiting", queueId: queueId, value: true });
        break;
      case "connected":
        if (!event.value) {
          for (const chatId of waitingQueueIds) {
            events.emit({type: "waiting", queueId: chatId, value: false});
          }
          accumulated = {};
          waitingQueueIds = [];
          subscribedQueueIds = [];
        }
        events.emit(event);
        break;
    }
  });

  return {
    events,

    isConnected(): boolean {
      return client.isConnected();
    },
    isWaiting(chatId: string): boolean {
      return waitingQueueIds.includes(chatId);
    },
    async sendMessage({ content, queueId }): Promise<number | undefined> {
      for (let i = 0; i < SEND_MESSAGE_ATTEMPTS; i++) {
        const {key, nonce} = await generateNewKey({queueId, persistence, cache: []});

        const encrypted = await encryptContent({content, key});

        const status = await client.sendMessage({
          message: {
            nonce,
            queueId: queueId,
            chatId: queueId,
            ...encrypted
          }
        });

        if (status) return nonce;
      }
    },

    async subscribe({ queueId, nonce }): Promise<void> {
      if (subscribedQueueIds.includes(queueId)) return;
      subscribedQueueIds.push(queueId);
      return client.subscribe({queueId: queueId, nonce});
    },
  };
}

async function decryptNewEvents(
  persistence: KeyPersistence,
  chatId: string,
  events: (ClientEvent & { type: "new" })[]
): Promise<SeedWorkerEvent> {
  const messages: Message[] = [];
  const cache: IndexedKey[] = [];

  for (const event of events) {
    const {nonce, signature, content, contentIV} = event.message;
    const key = await generateKeyAt({chatId, nonce, persistence, cache});
    const decrypted = await decryptContent({content, contentIV, signature, key});

    const message: Message = {
      key, chatId, nonce,
      content: typia.is<MessageContent>(decrypted) ? decrypted : { type: "unknown" }
    }

    messages.push(message);
  }

  await persistence.add({ queueId: chatId, keys: cache });
  return { type: "new", queueId: chatId, messages };
}

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
  chatId: string;
  messages: Message[];
} | {
  type: "connected";
  value: boolean;
} | {
  type: "waiting";
  chatId: string;
  value: boolean;
};

export type SendMessageOptions = {
  chatId: string;
  content: MessageContent;
}

export type SubscribeOptions = {
  chatId: string;
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
  let waitingChatIds: string[] = [];
  let subscribedChatIds: string[] = [];

  client.events.subscribeAsChannel().onEach(async (event) => {
    switch (event.type) {
      case "new":
        console.log("WAIT NEW", event.message.chatId, waitingChatIds);
        if (waitingChatIds.includes(event.message.chatId)) {
          const decrypted = await decryptNewEvents(persistence, event.message.chatId, [event]);
          events.emit(decrypted);
        } else {
          if (!(event.message.chatId in accumulated)) {
            accumulated[event.message.chatId] = [];
          }
          accumulated[event.message.chatId]!.push(event);
        }
        break;
      case "wait":
        console.log("WAIT");
        waitingChatIds.push(event.chatId);
        if (event.chatId in accumulated) {
          const decrypted = await decryptNewEvents(persistence, event.chatId, accumulated[event.chatId]);
          delete accumulated[event.chatId];
          events.emit(decrypted);
        }
        events.emit({ type: "waiting", chatId: event.chatId, value: true });
        break;
      case "connected":
        if (!event.value) {
          for (const chatId of waitingChatIds) {
            events.emit({type: "waiting", chatId, value: false});
          }
          accumulated = {};
          waitingChatIds = [];
          subscribedChatIds = [];
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
      return waitingChatIds.includes(chatId);
    },
    async sendMessage({ content, chatId }): Promise<number | undefined> {
      for (let i = 0; i < SEND_MESSAGE_ATTEMPTS; i++) {
        const {key, nonce} = await generateNewKey({chatId, persistence, cache: []});

        const encrypted = await encryptContent({content, key});

        const status = await client.sendMessage({
          message: {
            nonce, chatId,
            ...encrypted
          }
        });

        if (status) return nonce;
      }
    },

    async subscribe({ chatId, nonce }): Promise<void> {
      if (subscribedChatIds.includes(chatId)) return;
      subscribedChatIds.push(chatId);
      return client.subscribe({chatId, nonce});
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
    const {chatId, nonce, signature, content, contentIV} = event.message;
    const key = await generateKeyAt({chatId, nonce, persistence, cache});
    const decrypted = await decryptContent({content, contentIV, signature, key});

    const message: Message = {
      key, chatId, nonce,
      content: typia.is<MessageContent>(decrypted) ? decrypted : { type: "unknown" }
    }

    messages.push(message);
  }

  await persistence.add({ chatId, keys: cache });
  return { type: "new", chatId, messages };
}

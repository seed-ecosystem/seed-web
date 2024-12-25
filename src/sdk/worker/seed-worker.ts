import {SeedClient} from "@/sdk/client/seed-client.ts";
import {generateKeyAt, generateNewKey} from "@/sdk/worker/generate-key.ts";
import {encryptContent} from "@/sdk/crypto/encrypt-content.ts";
import {ClientEvent} from "@/sdk/client/client-event.ts";
import {decryptContent} from "@/sdk/crypto/decrypt-content.ts";
import {Message, MessageContent} from "@/sdk/worker/message.ts";
import typia from "typia";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {KeyPersistence} from "@/sdk/worker/key-persistence.ts";

export type SeedWorkerEvent = {
  type: "new";
  message: Message;
} | {
  type: "connected";
  value: boolean;
} | {
  type: "wait";
  chatId: string;
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

  client.events.subscribeAsChannel().onEach(async (event) => {
    switch (event.type) {
      case "new":
        events.emit(await decryptNewEvent(persistence, event));
        break;
      case "connected":
      case "wait":
        events.emit(event);
    }
  });

  return {
    events,

    isConnected(): boolean {
      return client.isConnected();
    },

    async sendMessage({ content, chatId }): Promise<number | undefined> {
      for (let i = 0; i < SEND_MESSAGE_ATTEMPTS; i++) {
        const {key, nonce} = await generateNewKey({chatId, persistence});

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

    subscribe({ chatId, nonce }): Promise<void> {
      return client.subscribe({chatId, nonce});
    },
  };
}

async function decryptNewEvent(
  persistence: KeyPersistence,
  event: ClientEvent & { type: "new" }
): Promise<SeedWorkerEvent> {
  const {chatId, nonce, signature, content, contentIV} = event.message;

  const key = await generateKeyAt({chatId, nonce, persistence});
  const decrypted = await decryptContent({content, contentIV, signature, key});

  const message: Message = {
    key, chatId, nonce,
    content: typia.is<MessageContent>(decrypted) ? decrypted : { type: "unknown" }
  }

  return {
    type: "new",
    message
  };
}

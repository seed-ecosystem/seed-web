import { createPersistence, SeedPersistence } from "@/modules/umbrella/persistence/seed-persistence.ts";
import { createSeedSocket } from "@/sdk/socket/seed-socket.ts";
import { createMainLogic, MainLogic } from "@/modules/main/logic/main-logic.ts";
import { createSeedClient, SeedClient } from "@/sdk/client/seed-client.ts";
import { createSeedWorker as seedWorker, SeedWorker } from "@/sdk/worker/seed-worker.ts";
import { AddKeyOptions, KeyPersistence } from "@/sdk/worker/key-persistence.ts";
import { IndexedKey } from "@/sdk/worker/indexed-key.ts";
import { Chat } from "@/modules/main/chat-list/persistence/chat.ts";
import { subscribeToChats } from "@/modules/umbrella/logic/subscribe-to-chats.ts";
import { createWorkerStateHandle } from "@/modules/umbrella/logic/worker-state-handle.ts";
import { createObservable, Observable } from "@/coroutines/observable.ts";
import { createChatListStateHandle } from "@/modules/main/chat-list/logic/chat-list-state-handle.ts";
import { pickRandomNickname } from "@/modules/umbrella/logic/pick-random-nickname.ts";
import { launch } from "@/coroutines/launch.ts";
import { createChatStateHandle } from "@/modules/main/logic/chat-state-handle.ts";
import { createSeedEngine } from "@/sdk-v2/seed-engine";

export type LogicEvent = {
  type: "open",
  chatId: string;
}

export interface Logic {
  events: Observable<LogicEvent>
  importChat(chat: Chat): void;
  createMain(): MainLogic;
}

export async function createLogic(): Promise<Logic> {
  const events: Observable<LogicEvent> = createObservable();
  const persistence = await createPersistence();
  const engine = createSeedEngine("https://meetacy.app/seed-kt");
  const client = createSeedClient({ engine });
  const worker = createSeedWorker({ client, persistence });
  const workerStateHandle = createWorkerStateHandle({ worker, persistence });
  const chatStateHandle = createChatStateHandle();
  const chatListStateHandle = createChatListStateHandle({ persistence, chatStateHandle });

  await pickRandomNickname({ persistence });
  subscribeToChats({ persistence, worker: workerStateHandle });

  return {
    events,
    importChat(chat: Chat) {
      launch(async () => {
        const exists = await persistence.chat.exists(chat.id);
        if (exists) {
          events.emit({ type: "open", chatId: chat.id });
          return;
        }
        await worker.subscribe({ queueId: chat.id, nonce: chat.initialNonce });
        await persistence.chat.put(chat);
        chatListStateHandle.unshift(chat);
        events.emit({ type: "open", chatId: chat.id });
      });
    },
    createMain: () => createMainLogic({ persistence, worker: workerStateHandle, chatListStateHandle, chatStateHandle }),
  };
}

type CreateSeedWorkerOptions = {
  client: SeedClient;
  persistence: SeedPersistence;
};

function createSeedWorker({ client, persistence }: CreateSeedWorkerOptions): SeedWorker {

  const keyPersistence: KeyPersistence = {
    async add({ queueId, keys }: AddKeyOptions): Promise<void> {
      await persistence.key.add(keys.map(key => {
        return {
          chatId: queueId,
          nonce: key.nonce,
          key: key.key,
        };
      }));
    },

    async getInitialKey({ queueId }): Promise<IndexedKey> {
      const data = (await persistence.chat.get(queueId))!;
      return {
        key: data.initialKey,
        nonce: data.initialNonce,
      };
    },

    async getKeyAt({ queueId, nonce }): Promise<string | undefined> {
      const data = await persistence.key.get({ chatId: queueId, nonce });
      return data?.key;
    },

    async getLastKey({ queueId }): Promise<IndexedKey | undefined> {
      const data = await persistence.key.lastKey({ chatId: queueId });
      if (!data) return;
      return {
        key: data.key,
        nonce: data.nonce,
      };
    },
  };

  return seedWorker({ client, persistence: keyPersistence });
}

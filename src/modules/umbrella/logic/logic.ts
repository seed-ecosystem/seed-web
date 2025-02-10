import { createPersistence, SeedPersistence } from "@/modules/umbrella/persistence/seed-persistence.ts";
import { createMainLogic, MainLogic } from "@/modules/main/logic/main-logic.ts";
import { createSeedWorker as seedWorker, SeedWorker } from "@/sdk-v2/seed-worker";
import { AddKeyOptions, IndexedKey, KeyPersistence } from "@/sdk-v2/key-persistence";
import { Chat } from "@/modules/main/chat-list/persistence/chat.ts";
import { subscribeToChats } from "@/modules/umbrella/logic/subscribe-to-chats.ts";
import { createWorkerStateHandle } from "@/modules/umbrella/logic/worker-state-handle.ts";
import { createObservable, Observable } from "@/coroutines/observable.ts";
import { createChatListStateHandle } from "@/modules/main/chat-list/logic/chat-list-state-handle.ts";
import { pickRandomNickname } from "@/modules/umbrella/logic/pick-random-nickname.ts";
import { launch } from "@/coroutines/launch.ts";
import { createChatStateHandle } from "@/modules/main/logic/chat-state-handle.ts";
import { createSeedClient as seedClient, SeedClient } from "@/sdk-v2/seed-client";

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
  const client = createSeedClient();
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
        worker.subscribe(
          chat.serverUrl,
          {
            queueId: chat.id,
            nonce: chat.initialNonce,
          },
        );
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

function createSeedClient() {
  const client = seedClient({
    engine: {
      mainUrl: "https://meetacy.app/seed-kt",
    },
  });
  client.setForeground(true);
  window.onfocus = function() {
    console.log(">> foreground(true)");
    client.setForeground(true);
  };
  window.onblur = function() {
    console.log("<< foreground(false)");
    client.setForeground(false);
  };
  return client;
}

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
      const data = await persistence.chat.get(queueId);
      if (!data) throw new Error("Don't have initial chat while should've");
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

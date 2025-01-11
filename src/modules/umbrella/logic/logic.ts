import {createPersistence, SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {createSeedSocket} from "@/sdk/socket/seed-socket.ts";
import {createMainLogic, MainLogic} from "@/modules/main/logic/main-logic.ts";
import {createSeedClient, SeedClient} from "@/sdk/client/seed-client.ts";
import {createSeedWorker as seedWorker, SeedWorker} from "@/sdk/worker/seed-worker.ts";
import {AddKeyOptions, KeyPersistence} from "@/sdk/worker/key-persistence.ts";
import {IndexedKey} from "@/sdk/worker/indexed-key.ts";
import {Chat} from "@/modules/main/chat-list/persistence/chat.ts";
import {subscribeToChats} from "@/modules/umbrella/logic/subscribe-to-chats.ts";
import {createWorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {createChatListStateHandle} from "@/modules/main/chat-list/logic/chat-list-state-handle.ts";

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
  const socket = createSeedSocket("https://meetacy.app/seed-go");
  const client = createSeedClient({socket});
  const worker = createSeedWorker({client, persistence});
  const workerStateHandle = createWorkerStateHandle({worker, persistence});
  const chatListStateHandle = createChatListStateHandle();

  subscribeToChats({persistence, worker});

  return {
    events,
    importChat(chat: Chat) {
      persistence.chat.exists(chat.id).then(exists => {
        if (exists) {
          events.emit({ type: "open", chatId: chat.id });
          return;
        }
        persistence.chat.add(chat).then(() => {
          events.emit({ type: "open", chatId: chat.id });
        });
        workerStateHandle.subscribe({ chatId: chat.id, nonce: chat.initialNonce });
        chatListStateHandle.set([chat, ...chatListStateHandle.get()]);
        console.log("SET!");
      });
    },
    createMain: () => createMainLogic({persistence, worker: workerStateHandle, chatListStateHandle})
  };
}

type CreateSeedWorkerOptions = {
  client: SeedClient;
  persistence: SeedPersistence;
};

function createSeedWorker({client, persistence}: CreateSeedWorkerOptions): SeedWorker {

  const keyPersistence: KeyPersistence = {
    async add({chatId, keys}: AddKeyOptions): Promise<void> {
      await persistence.key.add(keys.map(key => {
        return {
          chatId,
          nonce: key.nonce,
          key: key.key
        };
      }))
    },

    async getInitialKey({chatId}): Promise<IndexedKey> {
      const data = await persistence.chat.get(chatId);
      return {
        key: data.initialKey,
        nonce: data.initialNonce
      };
    },

    async getKeyAt({chatId, nonce}): Promise<string | undefined> {
      const data = await persistence.key.get({chatId, nonce});
      return data?.key;
    },

    async getLastKey({chatId}): Promise<IndexedKey | undefined> {
      const data = await persistence.key.lastKey({chatId});
      if (!data) return;
      return {
        key: data.key,
        nonce: data.nonce
      };
    }
  };

  return seedWorker({client, persistence: keyPersistence});
}

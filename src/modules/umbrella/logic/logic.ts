import {createPersistence, SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {createSeedSocket} from "@/sdk/socket/seed-socket.ts";
import {createMainLogic, MainLogic} from "@/modules/main/logic/main-logic.ts";
import {createSeedClient, SeedClient} from "@/sdk/client/seed-client.ts";
import {createSeedWorker as seedWorker, SeedWorker} from "@/sdk/worker/seed-worker.ts";
import {KeyPersistence} from "@/sdk/worker/key-persistence.ts";
import {IndexedKey} from "@/sdk/worker/indexed-key.ts";
import {Chat} from "@/modules/chat-list/persistence/chat.ts";
import {Channel} from "@/modules/coroutines/channel/channel.ts";
import {createChannel} from "@/modules/coroutines/channel/create.ts";
import {subscribeToChats} from "@/modules/umbrella/logic/subscribe-to-chats.ts";
import {saveNewMessages} from "@/modules/umbrella/logic/save-new-messages.ts";
import {createWorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";

export type LogicEvent = {
  type: "open",
  chatId: string;
}

export interface Logic {
  events: Channel<LogicEvent>
  importChat(chat: Chat): void;
  createMainLogic(): MainLogic;
}

export async function createLogic(): Promise<Logic> {
  const events: Channel<LogicEvent> = createChannel();
  const persistence = await createPersistence();
  const socket = createSeedSocket("https://meetacy.app/seed-go");
  const client = createSeedClient({socket});
  const worker = createSeedWorker({client, persistence});
  const workerStateHandle = createWorkerStateHandle({worker});

  await addBetaChat({persistence});

  subscribeToChats({persistence, worker});
  saveNewMessages({persistence, worker});

  return {
    events,
    importChat(chat: Chat) {
      persistence.chat.add(chat).then(() => {
        events.send({ type: "open", chatId: chat.id });
      });
      workerStateHandle.subscribe({ chatId: chat.id, nonce: chat.initialNonce });
    },
    createMainLogic(): MainLogic {
      return createMainLogic({persistence, worker: workerStateHandle});
    }
  };
}

async function addBetaChat(
  {persistence}: {
    persistence: SeedPersistence;
  }
) {
  const chatId = "bHKhl2cuQ01pDXSRaqq/OMJeDFJVNIY5YuQB2w7ve+c=";

  if ((await persistence.chat.list()).length == 0) {
    await persistence.chat.add({
      id: chatId,
      title: "Beta Chat",
      initialKey: "/uwFt2yxHi59l26H9V8VTN3Kq+FtRewuWNfz1TNVcnM=",
      initialNonce: 0
    });
  }
}

type CreateSeedWorkerOptions = {
  client: SeedClient;
  persistence: SeedPersistence;
};

type CachedKey = {
  chatId: string;
  nonce: number;
  key: string;
}

function createSeedWorker({client, persistence}: CreateSeedWorkerOptions): SeedWorker {
  const message = persistence.message;
  const chat = persistence.chat;

  const keys: Record<string, CachedKey | undefined> = {};

  const keyPersistence: KeyPersistence = {
    async getInitialKey({chatId}): Promise<IndexedKey> {
      const data = await chat.get(chatId);
      return {
        key: data.initialKey,
        nonce: data.initialNonce
      };
    },

    async getKeyAt({chatId, nonce}): Promise<string | undefined> {
      if (chatId in keys && keys[chatId]!.nonce < nonce) {
        return undefined;
      }
      const data = await message.get({chatId, nonce});
      return data?.key;
    },

    async getLastKey({chatId}): Promise<IndexedKey | undefined> {
      if (chatId in keys) {
        return keys[chatId];
      }
      const data = await message.lastMessage({chatId});
      if (!data) return;
      return {
        key: data.key,
        nonce: data.nonce
      };
    }
  };

  const worker = seedWorker({client, persistence: keyPersistence});

  worker.events.subscribe(event => {
    if (event.type != "new") return;
    keys[event.message.chatId] = {
      chatId: event.message.chatId,
      key: event.message.key,
      nonce: event.message.nonce
    };
  });

  return worker;
}

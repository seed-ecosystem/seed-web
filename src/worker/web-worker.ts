import {createSeedWorker as seedWorker, SeedWorker} from "@/sdk/worker/seed-worker.ts";
import {sanitizeContent} from "@/modules/core/logic/sanitize-messages.ts";
import {createPersistence, SeedPersistence} from "@/worker/persistence/seed-persistence.ts";
import {createSeedSocket} from "@/sdk/socket/seed-socket.ts";
import {createSeedClient, SeedClient} from "@/sdk/client/seed-client.ts";
import {AddKeyOptions, KeyPersistence} from "@/sdk/worker/key-persistence.ts";
import {IndexedKey} from "@/sdk/worker/indexed-key.ts";
import {Message, MessageContent} from "@/sdk/worker/message.ts";
import typia from "typia";
import {launch} from "@/modules/coroutines/launch.ts";

export type WorkerRequest = {
  type: "connected";
  id: string;
} | {
  type: "waiting";
  id: string;
  chatId: string;
} | {
  type: "send";
  id: string;
  chatId: string;
  content: MessageContent;
} | {
  type: "subscribe";
  id: string;
  chatId: string;
  nonce: number;
}

export type WorkerMessage = {
  type: "event";
  event: WorkerEvent;
} | {
  type: "response";
  response: WorkerResponse;
}

export type WorkerEvent = {
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

export type WorkerResponse = {
  type: "connected";
  id: string;
  value: boolean;
} | {
  type: "waiting";
  id: string;
  value: boolean;
} | {
  type: "send";
  id: string;
  value?: number;
}

launch(async () => {
  const persistence = await createPersistence();
  const socket = createSeedSocket("https://meetacy.app/seed-go");
  const client = createSeedClient({socket});
  const worker = createSeedWorker({client, persistence});

  (self as any).onconnect = (e: any) => {
    const port: MessagePort = e.ports[0];
    startWorker(worker, persistence, port);
  }

});

function startWorker(
  seedWorker: SeedWorker,
  persistence: SeedPersistence,
  port: MessagePort
) {
  port.onmessage = (event) => {
    const request = event.data;
    // todo: for some reason vite doesn't apply unrollup/tipia for worker
    if (!typia.is<WorkerRequest>(request)) return;

    switch (request.type) {
      case "connected":
        postResponse(port, {
          type: "connected",
          id: request.id,
          value: seedWorker.isConnected()
        });
        break;
      case "waiting":
        postResponse(port, {
          type: "waiting",
          id: request.id,
          value: seedWorker.isWaiting(request.chatId)
        });
        break;
      case "send":
        seedWorker.sendMessage(request).then(result => {
          postResponse(port, {
            type: "send",
            id: request.id,
            value: result
          });
        });
        break;
      case "subscribe":
        launch(() => seedWorker.subscribe(request));
        break;
    }
  };

  seedWorker.events.subscribeAsChannel().onEach(async event => {
    let result: WorkerEvent;

    switch (event.type) {
      case "new":
        const messages = event.messages.map(message => {
          return {
            ...message,
            content: sanitizeContent(message.content)
          }
        });
        await persistence.message.add(messages);
        result = { ...event, messages }
        break;
      case "waiting":
      case "connected":
        result = event;
        break;
    }

    const message: WorkerMessage = { type: "event", event: result };
    port.postMessage(message);
  });
}

function postResponse(port: MessagePort, response: WorkerResponse) {
  const message: WorkerMessage = {
    type: "response",
    response
  };
  port.postMessage(message);
}

type CreateSeedWorkerOptions = {
  client: SeedClient;
  persistence: SeedPersistence;
}

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
      const data = (await persistence.chat.get(chatId))!;
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

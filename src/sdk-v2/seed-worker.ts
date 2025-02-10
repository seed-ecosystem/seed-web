import typia from "typia";
import { createObservable, Observable } from "@/coroutines/observable.ts";
import { IndexedKey, KeyPersistence } from "@/sdk-v2/key-persistence";
import { SeedClient, SeedClientEvent } from "./seed-client";
import { randomAESKey } from "@/crypto/subtle";
import { decryptContent, deriveNextKey, encryptContent } from "./seed-crypto";

export type SeedWorkerEvent = {
  type: "connected";
  connected: boolean;
} | {
  type: "new";
  queueId: string;
  url: string;
  messages: SeedWorkerMessage[];
} | {
  type: "waiting";
  url: string;
  queueId: string;
  waiting: boolean;
}

export interface SeedWorkerMessage {
  queueId: string;
  key: string;
  nonce: number;
  url: string;
  content: SeedWorkerMessageContent;
}

export type SeedWorkerMessageContent = {
  type: "regular";
  title: string;
  text: string;
} | {
  type: "unknown";
}

export type SeedWorkerSendOptions = {
  queueId: string;
  content: SeedWorkerMessageContent;
}

export type SeedWorkerSubscribeOptions = {
  queueId: string;
  nonce: number;
}

/**
 * SeedWorker is another layer of abstraction for Seed Protocol
 * which is built on top of SeedClient. SeedWorker handles all the
 * encryption and description which can't be done at SeedClient since
 * it requires persistence.
 */
export interface SeedWorker {
  events: Observable<SeedWorkerEvent>;

  getConnected(): boolean;

  getWaiting(url: string, queueId: string): boolean;

  subscribe(url: string, options: SeedWorkerSubscribeOptions): void;

  send(url: string, options: SeedWorkerSendOptions): Promise<number | undefined>;
}

type AccumulatedEventsMap = Map<string, Map<string, SeedClientEventNew[]>>

type SeedClientEventNew = SeedClientEvent & { type: "new" }

const SEND_MESSAGE_ATTEMPTS = 20;

export function createSeedWorker(
  { client, persistence }: {
    client: SeedClient;
    persistence: KeyPersistence;
  },
): SeedWorker {
  const events = createObservable<SeedWorkerEvent>();

  const accumulatedEvents: AccumulatedEventsMap = new Map();

  function addAccumulated(event: SeedClientEventNew) {
    const urlEvents = accumulatedEvents.get(event.url)
      ?? new Map<string, SeedClientEventNew[]>();
    accumulatedEvents.set(event.url, urlEvents);

    const queueEvents = urlEvents.get(event.message.queueId) ?? [];
    urlEvents.set(event.message.queueId, queueEvents);

    queueEvents.push(event);
  }

  const subscribedQueues: Map<string, Set<string>> = new Map();

  function addSubscription(url: string, queueId: string) {
    const urlQueues = subscribedQueues.get(url) ?? new Set();
    subscribedQueues.set(url, urlQueues);
    if (urlQueues.has(queueId)) return false;
    urlQueues.add(queueId);
    return true;
  }


  client.events.subscribeAsChannel().onEach(async (event) => {
    switch (event.type) {
      case "connected":
        events.emit(event);
        break;
      case "waiting":
        if (!event.waiting) {
          const urlEvents = accumulatedEvents.get(event.url);
          if (urlEvents) {
            const queueEvents = urlEvents.get(event.url);
            if (queueEvents) {
              const decrypted = await decryptNewEvents(
                persistence,
                event.queueId,
                event.url,
                queueEvents,
              );
              events.emit(decrypted);
            }
          }
        }
        events.emit(event);
        break;
      case "new":
        {
          const queueId = event.message.queueId;
          if (client.getWaiting(event.url, queueId)) {
            const decrypted = await decryptNewEvents(
              persistence,
              queueId,
              event.url,
              [event],
            );
            events.emit(decrypted);
          } else {
            addAccumulated(event);
          }
        }
        break;
    }
  });

  return {
    events,

    getConnected(): boolean {
      return client.getConnected();
    },
    getWaiting(url: string, queueId: string): boolean {
      return client.getWaiting(url, queueId);
    },
    async send(url, { content, queueId }): Promise<number | undefined> {
      for (let i = 0; i < SEND_MESSAGE_ATTEMPTS; i++) {
        const { key, nonce } = await generateNewKey({
          url,
          queueId,
          persistence,
          cache: [],
        });

        const encrypted = await encryptContent({ content, key });

        const status = await client.send(
          url,
          {
            nonce,
            queueId: queueId,
            ...encrypted,
          },
        );

        if (status) return nonce;
      }
    },

    subscribe(url: string, { queueId, nonce }) {
      if (addSubscription(url, queueId)) {
        client.subscribe(url, { queueId, nonce });
      }
    },
  };
}

async function decryptNewEvents(
  persistence: KeyPersistence,
  queueId: string,
  url: string,
  events: SeedClientEventNew[],
): Promise<SeedWorkerEvent> {
  const messages: SeedWorkerMessage[] = [];
  const cache: IndexedKey[] = [];

  for (const event of events) {
    const { nonce, signature, content, contentIV } = event.message;
    const key = await generateKeyAt({ url, queueId, nonce, persistence, cache });
    const decrypted = await decryptContent({ content, contentIV, signature, key });

    const message: SeedWorkerMessage = {
      url: event.url,
      key, queueId, nonce,
      content: typia.is<SeedWorkerMessageContent>(decrypted)
        ? decrypted
        : { type: "unknown" },
    };

    messages.push(message);
  }

  await persistence.add({ queueId, url, keys: cache });
  return { type: "new", queueId, url, messages };
}

type GenerateNewKeyOptions = {
  queueId: string;
  url: string;
  persistence: KeyPersistence;
  cache: IndexedKey[];
}

async function generateNewKey(
  { queueId, url, persistence, cache }: GenerateNewKeyOptions,
): Promise<IndexedKey> {
  let last = await persistence.getLastKey({ url, queueId });

  if (cache.length > 0) {
    const cachedKey = cache[cache.length - 1];
    if (!last || last.nonce < cachedKey.nonce) {
      last = cachedKey;
    }
  }

  let newKey;
  let newNonce;

  if (last) {
    newKey = await deriveNextKey({ key: last.key });
    newNonce = last.nonce + 1;
  } else {
    const { key, nonce } = await persistence.getInitialKey({ queueId, url });
    newKey = key;
    newNonce = nonce;
  }

  return {
    key: newKey,
    nonce: newNonce,
  };
}

type GenerateKeyAtOptions = {
  nonce: number;
  queueId: string;
  url: string;
  persistence: KeyPersistence;
  cache: IndexedKey[];
}

async function generateKeyAt({ queueId, url, nonce, persistence, cache }: GenerateKeyAtOptions): Promise<string> {
  let existing = await persistence.getKeyAt({ queueId, url, nonce });
  if (existing) return existing;
  existing = cache.find(value => value.nonce == nonce)?.key;
  if (existing) return existing;

  let { nonce: lastNonce, key: lastKey } = await generateNewKey({ queueId, url, persistence, cache });

  if (lastNonce > nonce) {
    // TODO: some bug is hidden here. Sometimes it can't generate key when it should
    console.error(`Cannot generate key backwards: from ${lastNonce.toString()} to ${nonce.toString()}`);
    return await randomAESKey();
  }

  cache.push({ key: lastKey, nonce: lastNonce });

  while (lastNonce < nonce) {
    lastKey = await deriveNextKey({ key: lastKey });
    lastNonce++;
    cache.push({ key: lastKey, nonce: lastNonce });
  }

  return lastKey;
}


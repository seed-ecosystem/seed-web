import { createObservable, Observable } from "@/coroutines/observable";
import { createSeedEngine, LOG_LEVEL_INFO, SeedEngine, SeedEngineDisconnected } from "./seed-engine";
import typia from "typia";

export type SeedClientEvent = {
  type: "connected";
  connected: boolean;
} | {
  type: "new";
  url: string;
  message: SeedClientMessage;
} | {
  type: "waiting";
  url: string;
  queueId: string;
  waiting: boolean;
}

export type SeedClientMessage = {
  nonce: number;
  signature: string;
  content: string;
  contentIV: string;
  queueId: string;
}

export type SeedClientSendOptions = {
  nonce: number;
  signature: string;
  content: string;
  contentIV: string;
  queueId: string;
}

export type SeedClientSubscribeOptions = {
  queueId: string;
  nonce: number;
}

/**
 * SeedClient hides all network errors and makes it seem 
 * to the consumer like if the connection was just slow. So no retries
 * required from the user side.
 *
 * Client also provides type-safe accessors over seed protocol.
 */
export interface SeedClient {
  events: Observable<SeedClientEvent>;

  getConnected(): boolean;

  getWaiting(url: string, queueId: string): boolean;

  send(url: string, options: SeedClientSendOptions): Promise<boolean>;

  subscribe(url: string, options: SeedClientSubscribeOptions): void;

  /**
   * For some reason WebSockets are laggy and
   * don't disconnect right away, so we need to do it
   * manually in the window.ononline/window.onoffline callback
   */
  setForeground(value: boolean): void;
}

export interface CreateSeedClientOptions {
  engine: {
    mainUrl: string;
  };
}

type ServerEvent = {
  type: "new";
  message: SeedClientMessage;
} | {
  type: "wait";
  queueId: string;
}

type SendRequest = {
  type: "send";
  message: SeedClientSendOptions;
};

type SendResponse = {
  status: boolean
}

type SubscribeRequest = {
  type: "subscribe";
  queueId: string;
  nonce: number;
}

export function createSeedClient(
  { engine: engineOptions }: CreateSeedClientOptions,
): SeedClient {
  const events: Observable<SeedClientEvent> = createObservable();

  const engine = createSeedEngine(engineOptions.mainUrl, LOG_LEVEL_INFO);
  const subscribeQueues: Map<string, Set<string>> = new Map();

  function setSubscribeQueue(
    url: string,
    queueId: string,
    subscribed: boolean,
  ) {
    const urlQueues = subscribeQueues.get(url) ?? new Set();
    subscribeQueues.set(url, urlQueues);
    if (subscribed) {
      urlQueues.add(queueId);
    } else {
      urlQueues.delete(queueId);
    }
  }
  function getSubscribeQueue(url: string, queueId: string) {
    const urlQueues = subscribeQueues.get(url);
    return urlQueues !== undefined && urlQueues.has(queueId);
  }

  const waitingQueues: Map<string, Set<string>> = new Map();

  function setWaitingQueue(url: string, queueId: string, waiting: boolean) {
    const urlQueues = waitingQueues.get(url) ?? new Set();
    waitingQueues.set(url, urlQueues);
    if (waiting) {
      urlQueues.add(queueId);
    } else {
      urlQueues.delete(queueId);
    }
    events.emit({
      type: "waiting",
      url, queueId, waiting,
    });
  }

  function getWaitingQueue(url: string, queueId: string) {
    const urlQueues = waitingQueues.get(url);
    return urlQueues !== undefined && urlQueues.has(queueId);
  }

  engine.events.subscribe(event => {
    switch (event.type) {
      case "ready":
        events.emit({
          type: "connected",
          connected: event.ready,
        });
        break;
      case "connected":
        if (!event.connected) {
          const urlQueues = waitingQueues.get(event.url) ?? new Set();
          for (const queueId of urlQueues) {
            setWaitingQueue(event.url, queueId, false);
          }
        }
        break;
      case "server":
        if (!typia.is<ServerEvent>(event.payload)) break;
        switch (event.payload.type) {
          case "wait":
            setWaitingQueue(event.url, event.payload.queueId, true);
            break;
          case "new":
            events.emit({
              url: event.url,
              ...event.payload,
            });
            break;
          default:
            event.payload satisfies never;
        }
        break;
      default:
        event satisfies never;
    }
  });

  function getConnected() {
    return engine.getReady();
  }

  async function send(
    url: string,
    options: SeedClientSendOptions,
  ): Promise<boolean> {
    ensureServer(url);
    const request: SendRequest = {
      type: "send",
      message: options,
    };
    const response = await executeSafely(url, request);
    if (!typia.is<SendResponse>(response)) {
      throw new Error(`Unexpected response from server: ${JSON.stringify(response)}`);
    }
    return response.status;
  }

  function subscribe(url: string, { queueId, nonce }: SeedClientSubscribeOptions) {
    if (getSubscribeQueue(url, queueId)) {
      throw new Error(`Already subscribed to this chat id ${queueId}`);
    }
    setSubscribeQueue(url, queueId, true);
    const request: SubscribeRequest = {
      type: "subscribe",
      queueId, nonce,
    };
    ensureServer(url);
    if (engine.getConnected(url)) {
      engine.executeOrThrow(url, request).catch((error: unknown) => {
        // Supress disconnection errors here. We receive them
        // as events and retry request
        if (error instanceof SeedEngineDisconnected) return;
        throw error;
      });
    }
    engine.events.subscribe(event => {
      if (event.type !== "connected") return;
      if (event.url !== url) return;
      if (!event.connected) return;
      ensureServer(url);
      engine.executeOrThrow(url, request).catch((error: unknown) => {
        // Supress disconnection errors here. We receive them
        // as events and retry request
        if (error instanceof SeedEngineDisconnected) return;
        throw error;
      });
    });
  }

  const servers: Set<string> = new Set();

  /**
   * Retries request infinetely until internet connection
   * is fine.
   *
   * For now it's completely fine that this starts
   * executing even before some init logic for url
   * did. 
   * 
   * The example is `send` might be sent before all `subcsribe`
   * requests are processed. And that's no problem in current setup.
   *
   * However, later we might want asynchonous init logic to run before
   * any request (for example some handshake, etc.). So we might
   * introduce a new (private) observable with lifecycle events specifically 
   * for SeedClient.
   */
  async function executeSafely(
    url: string,
    payload: unknown,
  ): Promise<unknown> {
    if (engine.getConnected(url)) {
      try {
        ensureServer(url);
        const result = await engine.executeOrThrow(url, payload);
        return result;
      } catch (error) {
        if (!(error instanceof SeedEngineDisconnected)) {
          throw error;
        }
      }
    }
    return new Promise((resolve, reject) => {
      const cancel = engine.events.subscribe(
        (event) => {
          if (event.type !== "connected") return;
          if (event.url !== url) return;
          if (!event.connected) return;
          cancel();
          executeSafely(url, payload).then(resolve, reject);
        },
      );
    });
  }
  /**
   * SeedClient automatically manages connections
   * with different servers and tries reconnect when
   * server is disconnected.
   */
  function ensureServer(url: string) {
    if (servers.has(url)) {
      return;
    }
    servers.add(url);
    pingServer(url);
    let timeout = 1;
    engine.events.subscribe(event => {
      if (event.type !== "connected") return;
      if (event.url !== url) return;
      if (event.connected) return;
      // Remove constant throttling for unreachable servers
      timeout = Math.min(timeout * 2, 15_000);
      setTimeout(() => {
        connectUrlSafely(engine, url);
      }, timeout);
    });
    connectUrlSafely(engine, url);
  }

  function pingServer(url: string) {
    setInterval(() => {
      if (!engine.getConnected(url)) return;
      engine.executeOrThrow(
        url,
        {
          "type": "ping",
        },
      ).catch((error: unknown) => {
        // Ignore disconnect errors
        if (error instanceof SeedEngineDisconnected) return;
        throw error;
      });
    }, 15_000);
  }

  let foreground: boolean = false;

  function setForeground(value: boolean) {
    foreground = value;

    if (!foreground) {
      engine.close();
      return;
    }

    const engineAlreadyConnected = engine.getReady();
    if (engineAlreadyConnected) {
      return;
    }

    const cancel = engine.events.subscribe(event => {
      if (event.type !== "ready") return;
      if (event.ready) return;
      if (!foreground) {
        cancel();
        return;
      };
      engine.open();
    });

    engine.open();
  }

  return {
    events,
    getWaiting: getWaitingQueue,
    getConnected,
    send,
    subscribe,
    setForeground,
  };
}

function connectUrlSafely(engine: SeedEngine, url: string) {
  if (engine.getReady()) {
    engine.connectUrl(url);
    return;
  }
  const cancel = engine.events.subscribe((event) => {
    if (event.type !== "ready") return;
    if (!event.ready) return;
    cancel();
    connectUrlSafely(engine, url);
  });
}


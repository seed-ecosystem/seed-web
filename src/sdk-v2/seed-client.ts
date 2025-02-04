import { createObservable, Observable } from "@/coroutines/observable";
import { createSeedEngine, SeedEngine, SeedEngineDisconnected } from "./seed-engine";
import typia from "typia";

export type SeedClientEvent = {
  type: "connected";
  connected: boolean;
} | {
  type: "new";
  url: string;
  message: SeedClientMessage;
} | {
  type: "wait";
  url: string;
  queueId: string;
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

  send(url: string, options: SeedClientSendOptions): Promise<boolean>;

  subscribe(url: string, options: SeedClientSubscribeOptions): void;

  /**
   * SeedClient automatically manages connections
   * with different servers and tries reconnect when
   * server is disconnected.
   */
  addServer(url: string): void;

  /**
   * This should be synced with window lifecycle.
   * setForeground(false) doesn't immediately shut
   * down socket, but rather prevents reconnects
   * in case if connection was lost.
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
  // TODO: proxy events
  const events: Observable<SeedClientEvent> = createObservable();

  const engine = createSeedEngine(engineOptions.mainUrl);
  const subscribeChatIds: Set<string> = new Set();

  engine.events.subscribe(event => {
    switch (event.type) {
      case "connected":
        events.emit(event);
        break;
      case "server":
        if (!typia.is<ServerEvent>(event.payload)) break;
        events.emit({
          url: event.url,
          ...event.payload,
        });
        break;
      default:
        event.type satisfies "ready";
    }
  });

  function getConnected() {
    return engine.getReady();
  }

  async function send(
    url: string,
    options: SeedClientSendOptions,
  ): Promise<boolean> {
    const request: SendRequest = {
      type: "send",
      message: options,
    };
    const response = await executeSafely(engine, url, request);
    if (!typia.is<SendResponse>(response)) {
      throw new Error(`Unexpected response from server: ${JSON.stringify(response)}`);
    }
    return response.status;
  }

  function subscribe(url: string, { queueId, nonce }: SeedClientSubscribeOptions) {
    if (subscribeChatIds.has(url)) {
      throw new Error(`Already subscribed to this chat id ${queueId}`);
    }
    subscribeChatIds.add(url);
    const request: SubscribeRequest = {
      type: "subscribe",
      queueId, nonce,
    };
    if (engine.getConnected(url)) {
      void engine.executeOrThrow(url, request);
    }
    engine.events.subscribe(event => {
      if (event.type !== "connected") return;
      if (event.url !== url) return;
      void engine.executeOrThrow(url, request);
    });
  }

  const servers: Set<string> = new Set();

  function addServer(url: string) {
    if (servers.has(url)) {
      throw new Error("Can't add a server multiple times");
    }
    servers.add(url);
    engine.events.subscribe(event => {
      if (event.type !== "connected") return;
      if (event.url !== url) return;
      if (event.connected) {
        // TODO: Do initial subscribes, etc.
      } else {
        connectUrlSafely(engine, url);
      }
    });
    connectUrlSafely(engine, url);
  }

  let foreground: boolean = false;

  function setForeground(value: boolean) {
    foreground = value;
    if (!foreground) return;
    if (engine.getReady()) return;

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
    getConnected,
    send,
    subscribe,
    addServer,
    setForeground,
  };
}

/**
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
  engine: SeedEngine,
  url: string,
  payload: unknown,
): Promise<unknown> {
  if (engine.getConnected(url)) {
    try {
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
        executeSafely(engine, url, payload).then(resolve, reject);
      },
    );
  });
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


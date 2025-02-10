import { launch } from "@/coroutines/launch";
import { createObservable, Observable } from "@/coroutines/observable";
import typia from "typia";

export type SeedEngineEvent = {
  type: "ready";
  ready: boolean;
} | {
  type: "connected";
  url: string;
  connected: boolean;
} | {
  type: "server"
  url: string;
  payload: unknown;
}

export type SeedEngineInitOptions = {
  url: string;
  fn: () => Promise<void>;
}

export class SeedEngineDisconnected extends Error {
  constructor() {
    super("Disconnected while executing request");
    this.name = "SeedEngineDisconnected";
  }
}

type ConnectRequest = {
  type: "connect";
  url: string;
}

type DisconnectedEvent = {
  type: "disconnected";
  url: string;
}

type SeedEngineReceivedMessage =
  SeedEngineForwardReceivedMessage |
  SeedEngineRawReceivedMessage

type SeedEngineForwardReceivedMessage = {
  type: "forward";
  url: string;
  forward: SeedEngineRawReceivedMessage;
}

type SeedEngineRawReceivedMessage = {
  type: "response";
  response: unknown;
} | {
  type: "event";
  event: unknown;
}

type SeedEngineSentMessage = {
  type: "forward";
  url: string;
  request: unknown;
}

type SeedEnginePendingRequest = {
  url: string;
  resolve: (payload: unknown) => void;
  reject: () => void;
}

/**
 * SeedEngine should encapsulate the existence of
 * multiple servers.
 *
 * It may be ready or not, which
 * indicates whether to show 'connecting...' in UI
 * or not. 
 *
 * Any endpoint (even mainUrl) must be connected first.
 * That way we can easily change mainServer without
 * changing any logic on how we connected to other
 * servers.
 *
 * In case of mainUrl disconnection all urls receive disconnected
 * events and readyEvents receive false.
 * If any other server disconnects, only that server receives a
 * disconnected event.
 */
export interface SeedEngine {
  events: Observable<SeedEngineEvent>;

  getReady(): boolean;
  getConnected(url: string): boolean;
  connectUrl(url: string): void;

  /**
   * @throws SeedEngineDisconnected if request was not successful due to
   *  network conditions
   */
  executeOrThrow(url: string, payload: unknown): Promise<unknown>;

  open(): void;
}

export function createSeedEngine(mainUrl: string): SeedEngine {
  const events: Observable<SeedEngineEvent> = createObservable();

  let ws: WebSocket | undefined;
  const requests: SeedEnginePendingRequest[] = [];

  let ready: boolean = false;

  function setReady(value: boolean) {
    ready = value;
    events.emit({
      type: "ready",
      ready: value,
    });
    if (ready) return;
    while (connectedUrls.size) {
      const [url] = connectedUrls;
      setConnectedUrl(url, false);
    }
  }

  function getReady() {
    return ready;
  }

  const connectedUrls: Set<string> = new Set();

  function setConnectedUrl(url: string, connected: boolean) {
    if (connected) {
      connectedUrls.add(url);
    } else {
      connectedUrls.delete(url);
      requests
        .filter(({ url: requestUrl }) => requestUrl === url)
        .forEach((request) => {
          const index = requests.indexOf(request);
          requests.splice(index, 1);
          request.reject();
        });
    }
    events.emit({
      type: "connected",
      url, connected,
    });
  }

  function getConnected(url: string) {
    return connectedUrls.has(url);
  }

  function connectUrl(url: string) {
    launch(async () => {
      // Don't actually execute any requests
      // since we are already connected to this url
      if (url === mainUrl) {
        setConnectedUrl(url, getReady());
        return;
      }

      const payload: ConnectRequest = { type: "connect", url };

      try {
        await executeOrThrow(mainUrl, payload, false);
        setConnectedUrl(url, true);
      } catch (error) {
        setConnectedUrl(url, false);
        if (error instanceof SeedEngineDisconnected) return;
        throw error;
      }
    });
  }

  /**
   * Without [checkConnection] param it would be impossible to
   * execute any `connect` requests since they are used to establish
   * connection with other servers, so this check will always fail
   * without this flag.
   */
  function executeOrThrow(
    url: string,
    payload: unknown,
    checkConnection: boolean = true,
  ) {
    console.log(`>> execute\nServer: ${url}\nRequest:`, payload);
    return new Promise((resolve, reject) => {
      if (!ready) reject(new SeedEngineDisconnected());
      if (checkConnection && !connectedUrls.has(url)) {
        reject(new SeedEngineDisconnected());
      }

      requests.push({
        url, resolve,
        reject: () => {
          reject(new SeedEngineDisconnected());
        },
      });

      let message: unknown;

      if (url === mainUrl) {
        message = payload;
      } else {
        message = {
          type: "forward",
          url,
          request: payload,
        } satisfies SeedEngineSentMessage;
      }

      ws?.send(JSON.stringify(message));
    });
  }

  function open() {
    ws = new WebSocket(mainUrl);

    ws.onopen = () => {
      console.log("<< ws: onopen");
      setReady(true);
    };

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data as string) as SeedEngineReceivedMessage;
      if (!typia.is<SeedEngineReceivedMessage>(data)) {
        return;
      }
      let forward: SeedEngineForwardReceivedMessage;
      if (data.type === "forward") {
        forward = data;
      } else {
        forward = {
          type: "forward",
          url: mainUrl,
          forward: data,
        };
      }
      console.log(`<< message\nServer: ${forward.url}\nPayload:`, forward.forward);
      if (forward.forward.type === "response") {
        const index = requests.findIndex((request) => request.url === forward.url);
        if (index === -1) {
          console.warn("Got response without any request");
          return;
        }
        const { resolve } = requests[index];
        requests.splice(index, 1);
        if (forward.forward.response) {
          resolve(forward.forward.response);
        } else {
          resolve(forward.forward);
        }
      } else {
        if (typia.is<DisconnectedEvent>(forward.forward.event)) {
          setConnectedUrl(forward.forward.event.url, false);
          return;
        }
        events.emit({
          type: "server",
          url: forward.url,
          payload: forward.forward.event,
        });
      }
    };

    ws.onclose = () => {
      console.log("<< ws: onclose");
      setReady(false);
    };
  }

  return {
    events,
    getReady,
    getConnected,
    connectUrl,
    executeOrThrow,
    open,
  };
}


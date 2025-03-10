import { launch } from "@/coroutines/launch";
import { createObservable, Observable } from "@/coroutines/observable";
import typia from "typia";

export const LOG_LEVEL_NONE = 0;
export const LOG_LEVEL_WARN = 1;
export const LOG_LEVEL_INFO = 2;
export const LOG_LEVEL_DEBUG = 3;

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

type ForwardResponse = {
  status: boolean;
}

type SeedEnginePendingRequest = {
  url: string;
  log: boolean;
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
  close(): void;
}

export function createSeedEngine(
  mainUrl: string,
  logLevel: number = LOG_LEVEL_INFO,
): SeedEngine {
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
    if (logLevel >= LOG_LEVEL_INFO) {
      if (connected) {
        console.log(`>> connected:\nServer: ${url}`);
      } else {
        console.log(`>> disconnected:\nServer: ${url}`);
      }
    }
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
        if (logLevel >= LOG_LEVEL_INFO) {
          console.log(`>> connecting (url === mainUrl):\nServer: ${url}`);
        }
        setConnectedUrl(url, getReady());
        return;
      }

      if (logLevel >= LOG_LEVEL_INFO) {
        console.log(`>> connecting:\nServer: ${url}`);
      }

      const payload: ConnectRequest = { type: "connect", url };

      try {
        await executeOrThrow(mainUrl, payload, false, false);
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
    log: boolean = true,
    checkConnection: boolean = true,
  ) {
    if (log && logLevel >= LOG_LEVEL_INFO) {
      console.log(`>> execute\nServer: ${url}\nRequest:`, payload);
    }
    return new Promise((resolve, reject) => {
      if (!ready) reject(new SeedEngineDisconnected());
      if (checkConnection && !connectedUrls.has(url)) {
        reject(new SeedEngineDisconnected());
      }

      requests.push({
        url, resolve, log,
        reject: () => {
          reject(new SeedEngineDisconnected());
        },
      });

      if (url === mainUrl) {
        const string = JSON.stringify(payload);
        if (logLevel >= LOG_LEVEL_DEBUG) {
          console.log(">>> debug\n", string);
        }
        ws?.send(string);
        return;
      }

      const request = {
        type: "forward",
        url,
        request: payload,
      } satisfies SeedEngineSentMessage;

      // log is false since we already logged that request
      // 
      // checkConnection is false since it's just forward
      // request and I don't actually need to call connect
      // on mainUrl to make forward requests
      executeOrThrow(mainUrl, request, false, false).then((response) => {
        if (!typia.is<ForwardResponse>(response)) {
          reject(new Error("Unexpected response from backend"));
          return;
        }
        if (!response.status) {
          reject(new SeedEngineDisconnected());
        }
        // We don't call resolve here, because it will be called
        // when message with type 'forward' is received
      }, reject);
    });
  }

  function open() {
    ws = new WebSocket(mainUrl);

    ws.onopen = () => {
      if (logLevel >= LOG_LEVEL_INFO) {
        console.log("<< ws: onopen");
      }
      setReady(true);
    };

    ws.onmessage = (message) => {
      if (logLevel >= LOG_LEVEL_DEBUG) {
        console.log("<<< debug\n", message.data);
      }
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
      if (forward.forward.type === "response") {
        const response = forward.forward.response ?? forward.forward;

        const index = requests.findIndex((request) => request.url === forward.url);

        if (index === -1) {
          if (logLevel >= LOG_LEVEL_WARN) {
            console.warn("Got response without any request");
          }
          console.log(`<< response\nServer: ${forward.url}\nPayload:`, response);
          return;
        }

        const { resolve, log } = requests[index];
        requests.splice(index, 1);

        if (log && logLevel >= LOG_LEVEL_INFO) {
          console.log(`<< response\nServer: ${forward.url}\nPayload:`, response);
        }
        resolve(response);
      } else {
        const event = forward.forward.event;
        if (typia.is<DisconnectedEvent>(event)) {
          setConnectedUrl(event.url, false);
          return;
        }
        if (logLevel >= LOG_LEVEL_INFO) {
          console.log(`<< event\nServer: ${forward.url}\nPayload:`, event);
        }
        events.emit({
          type: "server",
          url: forward.url,
          payload: forward.forward.event,
        });
      }
    };

    ws.onclose = () => {
      if (logLevel >= LOG_LEVEL_INFO) {
        console.log("<< ws: onclose");
      }
      setReady(false);
    };
  }

  function close() {
    ws?.close();
  }

  return {
    events,
    getReady,
    getConnected,
    connectUrl,
    executeOrThrow,
    open,
    close,
  };
}


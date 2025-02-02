import { Cancellation } from "@/coroutines/cancellation";
import { createObservable, Observable } from "@/coroutines/observable";
import typia from "typia";

export type SeedEngineEvent = {
  url: string;
  payload: unknown;
}

export type SeedEngineExecuteOptions = {
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

type SeedEngineSentMessage = unknown | {
  type: "forward";
  url: string;
  request: unknown;
}

type SeedEnginePendingRequest = {
  url: string;
  resolve: (payload: unknown) => void;
  reject: () => void;
}

export interface SeedEngine {
  events: Observable<SeedEngineEvent>;

  connectedEvents: Observable<boolean>;
  getConnected(): void;

  disconnectedUrlEvents: Observable<string>;
  connectUrl(url: string): Promise<void>;

  /**
   * @throws SeedEngineDisconnected if request was not successful due to
   *  network conditions
   */
  executeOrThrow(request: SeedEngineExecuteOptions): Promise<unknown>;

  init(init: SeedEngineInitOptions): Cancellation;

  start(): void;
  stop(): void;
}

export function createSeedEngine(mainUrl: string): SeedEngine {
  const events: Observable<SeedEngineEvent> = createObservable();

  const connectedEvents: Observable<boolean> = createObservable();
  let connected = false;

  function setConnected(value: boolean) {
    connected = value;
    connectedEvents.emit(value);
  }

  const disconnectedUrlEvents: Observable<string> = createObservable();

  let ws: WebSocket | undefined;
  let requests: SeedEnginePendingRequest[] = [];
  let connectedUrls: string[] = [];

  async function connectUrl(url: string) {
    // It is fine to call connectUrl with mainUrl,
    // but it will just do nothing
    if (url === mainUrl) {
      connectedUrls.push(url);
      return;
    }
    const payload: ConnectRequest = {
      type: "connect",
      url,
    };

    try {
      await executeOrThrow({
        url: mainUrl,
        payload,
      }, false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      disconnectedUrlEvents.emit(url);
    }

    connectedUrls.push(url);
  }

  async function executeOrThrow(
    { url, payload }: SeedEngineExecuteOptions,
    checkConnection: boolean = true,
  ) {
    console.log(`>> execute\nServer: ${url}\nRequest:`, payload);
    return new Promise((resolve, reject) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        reject(new SeedEngineDisconnected());
        return;
      }
      if (checkConnection && !connectedUrls.includes(url)) {
        reject(new SeedEngineDisconnected());
        return;
      }

      requests.push({ url, resolve, reject });

      let message: SeedEngineSentMessage;

      if (url === mainUrl) {
        message = payload;
      } else {
        message = {
          type: "forward",
          url,
          request: payload,
        };
      }

      ws.send(JSON.stringify(message));
    });
  }

  function start() {
    ws = new WebSocket(mainUrl);

    ws.onopen = () => {
      console.log("<< ws: onopen");
      setConnected(true);
    };

    ws.onmessage = (message) => {
      const data: SeedEngineReceivedMessage = JSON.parse(message.data);
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
      const index = requests.findIndex((request) => request.url === forward.url);
      if (index === -1) {
        console.warn("Got response without any request");
        return;
      }
      const { resolve } = requests[index];
      requests.splice(index, 1);
      resolve(forward.forward);
    };

    ws.onclose = () => {
      console.log("<< ws: onclose");
      setConnected(false);
      for (const { reject } of requests) {
        reject();
      }
      requests = [];
      for (const url of connectedUrls) {
        disconnectedUrlEvents.emit(url);
      }
      connectedUrls = [];
    };
  }

  function stop() {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("SeedEngine.close() called while socket is closed");
    }
    ws?.close();
  }

  return {
    events,

    connectedEvents,
    getConnected: () => connected,

    disconnectedUrlEvents,
    connectUrl,

    executeOrThrow,

    start,
    stop,
  };
}


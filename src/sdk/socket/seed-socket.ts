import {SocketRequest} from "@/sdk/socket/socket-request.ts";
import typia from "typia";
import {SocketMessage} from "@/sdk/socket/socket-message.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {launch} from "@/coroutines/launch.ts";

export type SocketEvent = {
  type: "server";
  value: unknown;
} | {
  type: "connected";
  value: boolean;
};

export interface SeedSocket {
  events: Observable<SocketEvent>;

  isConnected(): boolean;

  execute<T>(request: SocketRequest<T>): Promise<T>;
}

interface QueuedRequest<T = unknown> {
  request: SocketRequest<T>;
  relaunch: boolean;
  resolve: (data: T) => void;
}

const PING_TIMEOUT = 15_000;
const RECONNECT_TIMEOUT = 1_000;

export function createSeedSocket(url: string): SeedSocket {
  let isConnected = false;

  let queuedRequests: QueuedRequest[] = [];
  const events = createObservable<SocketEvent>();

  function execute<T>({request, relaunch}: {request: SocketRequest<T>, relaunch: boolean}) {
    return new Promise<T>((resolve) => {
      queuedRequests.push({
        request,
        relaunch,
        resolve(data: unknown): void {
          resolve(data as T);
        }
      });
      if (ws.readyState === WebSocket.OPEN) {
        if (request.type !== "ping") {
          console.log(">> ws: execute", request);
        }
        ws.send(JSON.stringify(request));
      }
    })
  }

  let ws: WebSocket;
  let intervalId: number | undefined;

  const onclose = (e: Event | null) => {
    clearInterval(intervalId);
    intervalId = undefined;
    console.log("<< ws: onclose", e);
    isConnected = false;
    events.emit({ type: "connected", value: isConnected });
    setTimeout(setupWebsocket, RECONNECT_TIMEOUT);
  };

  function setupWebsocket() {
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("<< ws: onopen");
      isConnected = true;
      events.emit({ type: "connected", value: isConnected });

      intervalId = window.setInterval(
        () => {
          console.log(">> ws: ping");
          launch(() => execute({
            request: {
              type: "ping"
            },
            relaunch: false
          }));
        },
        PING_TIMEOUT
      );

      queuedRequests = queuedRequests.filter(({relaunch}) => relaunch);

      for (const {request} of queuedRequests) {
        try {
          console.log(">> ws: request", request);
          ws.send(JSON.stringify(request));
        } catch (e) {
          console.error("<< ws: open catch", e);
        }
      }
    };

    ws.onclose = onclose;

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);

      if (!typia.is<SocketMessage>(data)) return;

      if (data.type == "response") {
        const request = queuedRequests.shift();
        if (!request) throw new Error("Got response without any request");
        if (request.request.type !== "ping") {
          console.log("<< ws: response", data);
        }
        if (data.response) {
          request.resolve(data.response);
        } else {
          request.resolve(data);
        }
      }

      if (data.type == "event") {
        console.log("<< ws: message", data);
        events.emit({ type: "server", value: data.event });
      }
    };
  }

  window.addEventListener("offline", () => {
    ws.onclose = () => {};
    ws.close();
    onclose(null);
  });

  window.onpageshow = () => {
    if (ws.readyState == WebSocket.CONNECTING) {
      console.log("<< ws: reconnecting");
      ws.close();
    }
  };

  setupWebsocket();

  return {
    events,
    isConnected: () => isConnected,
    execute: (request) => execute({request, relaunch: true})
  }
}

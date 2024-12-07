import {SocketRequest} from "@/modules/socket/request/socket-request.ts";
import {Flow} from "@/modules/coroutines/flow.ts";
import {SocketEvent} from "@/modules/socket/event/socket-event.ts";
import {mutableSharedFlow, MutableSharedFlow} from "@/modules/coroutines/shared-flow.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import typia from "typia";
import {SocketMessage} from "@/modules/socket/event/socket-message.ts";

export interface SeedSocket {
  events: Flow<SocketEvent>

  /**
   * This request is executed once after the invocation and
   * then will re invoke it every time you reconnect.
   * Unless you call [stop].
   */
  // todo: make bind a lambda
  bind(request: SocketRequest<unknown>): void;

  /**
   * Removes [request] from queue that is being run on
   * every reconnect. This tries to find [request] by reference,
   * or throws an exception otherwise.
   */
  unbind(request: SocketRequest<unknown>): void;

  execute<T>(request: SocketRequest<T>): Promise<T>;
}

interface QueuedRequest<T = unknown> {
  request: SocketRequest<T>
  resolve: (data: T) => void;
}

const PING_TIMEOUT = 15_000;
const RECONNECT_TIMEOUT = 1_000;

export function createServerSocket(url: string): SeedSocket {
  const boundRequests: SocketRequest<unknown>[] = [];
  let queuedRequests: QueuedRequest[] = [];
  const events: MutableSharedFlow<SocketEvent> = mutableSharedFlow();

  function execute<T>(request: SocketRequest<T>) {
    return new Promise<T>((resolve) => {
      queuedRequests.push({
        request: request,
        resolve(data: unknown): void {
          resolve(data as T);
        }
      });
      if (ws.readyState == WebSocket.OPEN) {
        console.log(">> ws: execute", request);
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
    events.emit({type: "close"});
    setTimeout(setupWebsocket, RECONNECT_TIMEOUT);
  };

  window.onpageshow = () => {
    if (ws.readyState == WebSocket.CONNECTING) {
      console.log("<< ws: reconnecting");
      ws.close();
    }
  };

  function setupWebsocket() {
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("<< ws: onopen");

      intervalId = window.setInterval(
        () => {
          console.log("<< ws: ping");
          queuedRequests.push({
            request: { type: "ping" },
            resolve(data: unknown): void {}
          });
          ws.send(JSON.stringify({type: "ping"}));
        },
        PING_TIMEOUT
      );

      // Cleanup queued bound requests

      queuedRequests = queuedRequests.filter(
        ({request}) => !boundRequests.includes(request)
      );

      for (const {request} of queuedRequests) {
        try {
          console.log(">> ws: request", request);
          ws.send(JSON.stringify(request));
        } catch (e) {
          console.error("<< ws: open catch", e);
        }
      }

      for (const request of boundRequests) {
        launch(() => execute(request));
      }
    };

    ws.onclose = onclose;

    ws.onmessage = (message) => {
      const event = JSON.parse(message.data);

      if (!typia.is<SocketMessage>(event)) return;

      if (event.type == "response") {
        const request = queuedRequests.shift();
        if (!request) throw new Error("Got response without any request");
        console.log("<< ws: response", event);
        request.resolve(event);
      }

      if (event.type == "event") {
        console.log("<< ws: event", event);
        events.emit(event.event);
      }
    };
  }

  window.addEventListener("offline", () => {
    ws.onclose = () => {};
    ws.close();
    onclose(null);
  });

  setupWebsocket();

  return {
    events: events,

    bind(request: SocketRequest<unknown>) {
      console.log(">> ws: bind", request);
      boundRequests.push(request);
      launch(async () => {
        await this.execute(request);
      });
    },

    unbind(request: SocketRequest<unknown>) {
      console.log(">> ws: unbind", request);
      boundRequests.splice(boundRequests.indexOf(request), 1);
    },

    execute
  }
}

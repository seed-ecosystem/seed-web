import {SeedSocket} from "@/api/seed-socket.ts";
import {SocketRequest} from "@/api/request/socket-request.ts";
import typia from "typia";
import {SocketMessage} from "@/api/event/socket-message.ts";
import {MutableSharedFlow, mutableSharedFlow} from "@/coroutines/shared-flow.ts";
import {SocketEvent} from "@/api/event/socket-event.ts";
import {launch} from "@/coroutines/launch.ts";

interface QueuedRequest<T = unknown> {
  request: SocketRequest<T>
  resolve: (data: T) => void;
}

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

  function setupWebsocket() {
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("<< ws: onopen");

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

    ws.onclose = (e) => {
      console.error("<< ws: onclose", e);
      setTimeout(setupWebsocket, 1_000);
    };

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
        events.emit(event.event);
      }
    };
  }

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

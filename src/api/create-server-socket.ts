import {SeedSocket} from "@/api/seed-socket.ts";
import {SocketRequest} from "@/api/request/socket-request.ts";
import typia from "typia";
import {SocketEventResponse} from "@/api/event/socket-event-response.ts";

interface QueuedRequest<T = unknown> {
  request: SocketRequest<T>
  resolve: (data: T) => void;
}

export function createServerSocket(url: string): SeedSocket {
  const requests: QueuedRequest[] = [];

  let ws: WebSocket;

  function setupWebsocket() {
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("<< ws: onopen");
      for (const {request} of requests) {
        try {
          console.log(">> ws: request", request);
          ws.send(JSON.stringify(request));
        } catch (e) {
          console.error("<< ws: open catch", e);
        }
      }
    };

    ws.onerror = (e) => {
      console.error("<< ws: onerror", e);
      setTimeout(setupWebsocket, 1_000);
    };

    ws.onmessage = (message) => {
      const event = JSON.parse(message.data);

      if (typia.is<SocketEventResponse>(event)) {
        const request = requests.pop();
        if (!request) throw new Error("Got response without any request");
        console.log("<< ws: response", event);
        request.resolve(event);
      }
    };
  }

  setupWebsocket();

  return {
    execute<T>(request: SocketRequest<T>) {
      return new Promise<T>((resolve) => {
        requests.push({
          request: request,
          resolve(data: unknown): void {
            resolve(data as T);
          }
        });
        if (ws.readyState == WebSocket.OPEN) {
          console.log(">> ws: request", request);
          ws.send(JSON.stringify(request));
        }
      })
    },
  };
}

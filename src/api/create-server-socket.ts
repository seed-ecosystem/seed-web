import {SeedSocket} from "@/api/seed-socket.ts";
import {flow, FlowCollector, Subscription} from "@/flow/flow.ts";
import {SocketEvent} from "@/api/event/socket-event.ts";
import {Page} from "@/pager/pager.ts";
import {Message} from "@/api/message/message.ts";
import {SocketRequest} from "@/api/request/socket-request.ts";
import {SocketEventUnknown} from "@/api/event/socket-event-unknown.ts";
import {JsonEncoded} from "@/api/json/json-encoded.ts";
import {mutableSharedFlow} from "@/flow/shared-flow.ts";

export function createServerSocket(url: string): SeedSocket {
  const responseQueue: ((_: JsonEncoded) => void)[] = [];
  const events = mutableSharedFlow<SocketEvent>();
  let ws: WebSocket | undefined;

  return {
    events: events,

    messages: {
      async loadPage(): Promise<Page<Message>> {
        return {
          data: [],
          remaining: null
        };
      }
    },

    open(): Promise<void> {
      if (ws !== undefined) {
        throw new Error("Websocket is already opened");
      }

      return new Promise((resolve, _) => {
        ws = new WebSocket(url);
        ws.onmessage = (message) => {
          const event: SocketEvent = message.data;

          switch (event.type) {
            case "new":
              events.emit(event);
              return;
            case "response":
              const responseHandler = responseQueue.pop();
              if (responseHandler === undefined) {
                throw new Error("Got response without any request");
              }
              responseHandler(event.response)
              return;
            default:
              assertUnknown(event)
          }
        }
        ws.onopen = () => {
          resolve();
        }
      })
    },

    close(): void {
      ready(ws);
      ws.close();
      ws = undefined;
    },

    send<T>(request: SocketRequest<T>) {
      return new Promise((resolve, reject) => {
        ready(ws);
        ws.send(JSON.stringify(request));
        responseQueue.push(resolve);
      })
    },
  }
}

function ready(ws: WebSocket | undefined): asserts ws is WebSocket {
  if (ws === undefined) {
    throw new Error("Open websocket first");
  }
}

function assertUnknown(_: SocketEventUnknown) {}

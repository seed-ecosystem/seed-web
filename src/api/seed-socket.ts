import {Flow} from "@/coroutines/flow.ts";
import {SocketEvent} from "@/api/event/socket-event.ts";
import {SocketRequest} from "@/api/request/socket-request.ts";

export interface SeedSocket {
  events: Flow<SocketEvent>;

  execute<T>(request: SocketRequest<T>): Promise<T>;

  open(): Promise<void>;
  close(): void;
}

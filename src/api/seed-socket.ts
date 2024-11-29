import {SocketRequest} from "@/api/request/socket-request.ts";
import {Flow} from "@/coroutines/flow.ts";
import {SocketEvent} from "@/api/event/socket-event.ts";

export interface SeedSocket {
  events: Flow<SocketEvent>
  
  /**
   * This request is executed once after the invocation and
   * then will re invoke it every time you reconnect.
   * Unless you call [stop].
   */
  bind(request: SocketRequest<unknown>): void;

  /**
   * Removes [request] from queue that is being run on
   * every reconnect. This tries to fine [request] by reference,
   * or throws an exception otherwise.
   */
  unbind(request: SocketRequest<unknown>): void;
  
  execute<T>(request: SocketRequest<T>): Promise<T>;
}

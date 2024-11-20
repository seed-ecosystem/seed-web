import {Pager} from "@/pager/pager.ts";
import {Flow} from "@/flow/flow.ts";
import {SocketEvent} from "@/api/event/socket-event.ts";
import {SocketRequest} from "@/api/request/socket-request.ts";
import {Message} from "@/api/message/message.ts";

export interface SeedSocket {
  events: Flow<SocketEvent>;

  // Should be an extension-property
  // because implementation would send-message-message requests
  // to get pages, yet TS sucks and don't really
  // has *true* extensions :(
  messages: Pager<Message>;

  send<T>(request: SocketRequest<T>): Promise<T>;

  open(): Promise<void>;
  close(): void;
}

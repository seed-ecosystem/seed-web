import {SocketEvent} from "@/api/event/socket-event.ts";

export interface SocketMessageEvent {
  type: "event",
  event: SocketEvent;
}

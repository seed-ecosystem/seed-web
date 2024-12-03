import {SocketEvent} from "@/modules/socket/event/socket-event.ts";

export interface SocketMessageEvent {
  type: "event",
  event: SocketEvent;
}

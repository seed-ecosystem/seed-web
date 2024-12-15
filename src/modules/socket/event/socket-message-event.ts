import {ClientEvent} from "@/modules/client/event/client-event.ts";

export interface SocketMessageEvent {
  type: "event",
  event: ClientEvent;
}

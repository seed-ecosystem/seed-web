import {SocketMessageResponse} from "@/modules/socket/event/socket-message-response.ts";
import {SocketMessageEvent} from "@/modules/socket/event/socket-message-event.ts";

export type SocketMessage = SocketMessageResponse | SocketMessageEvent;

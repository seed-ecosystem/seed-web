import {SocketMessageResponse} from "@/api/event/socket-message-response.ts";
import {SocketMessageEvent} from "@/api/event/socket-message-event.ts";

export type SocketMessage = SocketMessageResponse | SocketMessageEvent;

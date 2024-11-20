import {SocketEventNew} from "@/api/event/socket-event-new.ts";
import {SocketEventResponse} from "@/api/event/socket-event-response.ts";
import {SocketEventUnknown} from "@/api/event/socket-event-unknown.ts";

export type SocketEvent = SocketEventNew | SocketEventResponse | SocketEventUnknown;

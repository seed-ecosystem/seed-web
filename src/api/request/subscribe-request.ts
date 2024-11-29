import {SocketRequest} from "@/api/request/socket-request.ts";

export interface SubscribeRequest extends SocketRequest<never> {
  type: "subscribe";
  chatId: string[];
}

import {SocketRequest} from "@/modules/socket/request/socket-request.ts";

export interface SubscribeRequest extends SocketRequest<SubscribeResponse> {
  type: "subscribe";
  chatId: string;
  nonce: number;
}

export interface SubscribeResponse {
  // Should never be false, just an acknowledgement
  status: true;
}

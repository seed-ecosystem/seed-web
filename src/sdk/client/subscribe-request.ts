import {SocketRequest} from "@/sdk/socket/socket-request.ts";

export interface SubscribeRequest extends SocketRequest<SubscribeResponse> {
  type: "subscribe";
  // todo: deprecate in favour of queueId
  chatId: string;
  queueId: string;
  nonce: number;
}

export interface SubscribeResponse {
  // Should never be false, just an acknowledgement
  status: true;
}

import {SocketRequest} from "@/api/request/socket-request.ts";
import {Message} from "@/api/message/message.ts";

export interface GetHistoryRequest extends SocketRequest<GetHistoryResponse> {
  type: "history";
  nonce: number | null;
  amount: number;
  chatId: string;
}

export interface GetHistoryResponse {
  messages: Message[] | undefined;
}

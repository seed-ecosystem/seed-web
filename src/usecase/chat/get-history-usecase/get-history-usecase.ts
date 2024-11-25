import {Message} from "@/usecase/chat/message/message.ts";

export interface GetHistoryUsecase {
  (options: {
    fromNonce: number | undefined;
    amount: number;
  }): Promise<Message[]>
}

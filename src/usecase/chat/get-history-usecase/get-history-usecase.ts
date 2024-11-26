import {Message} from "@/usecase/chat/message/message.ts";

export interface GetHistoryUsecase {
  (options: {
    nonce: number | null;
    amount: number;
  }): Promise<(
    Message & { nonce: { server: number } }
  )[]>
}

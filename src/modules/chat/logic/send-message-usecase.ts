import {Flow} from "@/modules/coroutines/flow.ts";
import {Message} from "@/modules/chat/logic/message.ts";

export type SendMessageEvent = {
  type: "sent";
  message: Message;
} | {
  type: "delivered";
  message: Message;
} | {
  type: "failed";
  message: Message;
}

export interface SendMessageUsecase {
  (text: string): Flow<SendMessageEvent>;
}

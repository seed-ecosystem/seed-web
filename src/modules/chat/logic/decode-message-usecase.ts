import {Message as ApiMessage} from "@/modules/socket/message/message.ts";
import {Message} from "@/modules/chat/logic/message.ts";

export interface DecodeMessageUsecase {
  (message: ApiMessage): Message
}

import {Message} from "@/api/message/message.ts";

export interface SocketEventNew {
  type: "new";
  message: Message;
}

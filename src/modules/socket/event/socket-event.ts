import {Message} from "@/modules/socket/message/message.ts";

export type SocketEvent = {
  type: "new";
  message: Message;
} | {
  type: "wait";
  chatId: string;
} | {
  type: "close";
};

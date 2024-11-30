import {Message} from "@/api/message/message.ts";

export type SocketEvent = {
  type: "new";
  message: Message;
} | {
  type: "wait";
  chatId: string;
};

import {Message} from "@/modules/client/message.ts";

export type ClientEvent = {
  type: "new";
  message: Message;
} | {
  type: "wait";
  chatId: string;
} | {
  type: "close";
} | {
  type: "open";
};

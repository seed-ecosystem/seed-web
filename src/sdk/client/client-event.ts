import {EncryptedMessage} from "@/sdk/client/encrypted-message.ts";

export type ClientEvent = {
  type: "new";
  message: EncryptedMessage;
} | ClientEventWait | {
  type: "connected";
  value: boolean;
};

export type ClientEventWait = {
  type: "wait";
} & ({
  // todo: deprecate
  chatId: string;
} | {
  queueId: string;
})

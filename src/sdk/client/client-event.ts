import {EncryptedMessageResponse} from "@/sdk/client/encrypted-message-response.ts";

export type ClientEvent = {
  type: "new";
  message: EncryptedMessageResponse;
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

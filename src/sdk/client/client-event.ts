import {EncryptedMessage} from "@/sdk/client/encrypted-message.ts";

export type ClientEvent = {
  type: "new";
  message: EncryptedMessage;
} | {
  type: "wait";
  chatId: string;
} | {
  type: "connected";
  value: boolean;
};

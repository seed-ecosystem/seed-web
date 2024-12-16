import {EncryptedMessage} from "@/sdk/client/encrypted-message.ts";

export type ClientEvent = RemoteClientEvent | {
  type: "is_connected";
  isConnected: boolean;
} | {
  type: "is_waiting";
  chatId: string;
  isWaiting: boolean;
};

// Used to typecheck with typia from server
export type RemoteClientEvent = {
  type: "new";
  message: EncryptedMessage;
} | {
  type: "wait";
  chatId: string;
};

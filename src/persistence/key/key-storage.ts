import {Chat} from "@/persistence/chat/chat.ts";

export interface KeyStorage {
  last(options: {
    chat: Chat;
  }): Promise<
    {
      key: string;
      nonce: number;
    } | undefined
  >;

  get(options: {
    chat: Chat;
    nonce: number;
  }): Promise<string | undefined>;

  push(options: {
    chat: Chat;
    key: string,
    nonce: number;
  }): Promise<void>;
}

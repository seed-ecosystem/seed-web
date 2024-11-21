import {Chat} from "@/persistence/chat/chat.ts";

export interface Message {
  nonce: number;
  chat: Chat;
  title: string;
  text: string;
  key: string;
}

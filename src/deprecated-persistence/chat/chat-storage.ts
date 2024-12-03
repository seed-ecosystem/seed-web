import {Chat} from "@/deprecated-persistence/chat/chat.ts";

export interface ChatStorage {
  add(chat: Chat): Promise<void>
  getInitialKey(chat: Chat): Promise<string>
  list(): Promise<Chat[]>
}

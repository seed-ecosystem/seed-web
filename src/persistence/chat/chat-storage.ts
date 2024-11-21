import {Chat} from "@/persistence/chat/chat.ts";

export interface ChatStorage {
  add(chat: Chat): Promise<void>
  list(): Promise<Chat[]>
}

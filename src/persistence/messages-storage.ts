import {Message} from "@/persistence/message/message.ts";
import {Chat} from "@/persistence/chat/chat.ts";

export interface MessagesStorage {
  add(chat: Chat, message: Message): Promise<void>;
  list(chat: Chat, fromId: string, amount: number): Promise<Message[]>;
}

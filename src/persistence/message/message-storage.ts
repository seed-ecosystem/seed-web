import {Message} from "@/persistence/message/message.ts";
import {Chat} from "@/persistence/chat/chat.ts";

export interface MessageStorage {
  lastMessage(chat: Chat): Promise<Message | undefined>;
  add(message: Message): Promise<void>;
  list(chat: Chat, fromId: number, amount: number): Promise<Message[]>;
}

import {Message} from "@/persistence/message/message.ts";
import {Chat} from "@/persistence/chat/chat.ts";

export interface MessageStorage {
  lastMessage(chat: Chat): Promise<Message | undefined>
  lastMessageNonce(chat: Chat): Promise<number>;
  add(message: Message): Promise<void>;
  list(chat: Chat): Promise<Message[]>;
}

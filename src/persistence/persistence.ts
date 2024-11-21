import {ChatStorage} from "@/persistence/chat/chat-storage.ts";
import {MessageStorage} from "@/persistence/message/message-storage.ts";

export interface Persistence {
  chat: ChatStorage;
  message: MessageStorage;
}

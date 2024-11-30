
import {Flow} from "@/coroutines/flow.ts";
import {Message} from "@/usecase/chat/message/message.ts";
import {Chat} from "@/persistence/chat/chat.ts";

export type ChatEvent = {
  type: "save";
  chat: Chat;
  message: Message & { nonce: { server: number } };
} | {
  type: "history";
  message: Message;
} | {
  type: "new";
  message: Message;
} | {
  type: "loaded";
} | {
  type: "edit";
  nonce: { server: number; } | { local: number; };
  message: Message;
} | {
  type: "reset_text";
} | {
  type: "nickname";
  nickname: string;
} | {
  type: "messages_snapshot";
  messages: Message[];
};

export interface EventBus {
  flow: Flow<ChatEvent>;
  emit(message: ChatEvent): void;
}

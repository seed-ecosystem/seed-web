import {Message} from "@/usecase/chat/message/message.ts";
import {Flow} from "@/coroutines/flow.ts";

export type ChatEvent = {
  type: "history";
  message: Message;
} | {
  type: "new";
  message: Message;
} | {
  type: "edit";
  nonce: { server: number; } | { local: number; };
  message: Message;
} | {
  type: "has_no_more";
} | {
  type: "reset_text"
};

export interface EventBus {
  flow: Flow<ChatEvent>;
  emit(message: ChatEvent): void;
}

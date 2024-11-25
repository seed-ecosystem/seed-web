import {Message} from "@/usecase/chat/message/message.ts";
import {Flow} from "@/coroutines/flow.ts";

export type ChatEvent = {
  type: "new";
  message: Message;
} | {
  type: "edit";
  nonce: { server: number; } | { local: number; };
  message: Message;
}

export interface EventsUsecase {
  flow: Flow<ChatEvent>;
  emit(message: ChatEvent): void;
}

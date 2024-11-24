import {Message} from "@/usecase/message/message.ts";
import {Flow} from "@/flow/flow.ts";

export type Event = {
  type: "send";
  message: Message;
} | {
  type: "edit";
  nonce: { server: number; } | { local: number; };
  message: Message;
}

export interface ChatEventsUsecase {
  flow: Flow<Event>;
  emit(message: Event): void;
}

import {EventBus, ChatEvent} from "@/usecase/chat/event-bus/event-bus.ts";
import {mutableSharedFlow} from "@/coroutines/shared-flow.ts";

export function createChatEventBus(): EventBus {
  const flow = mutableSharedFlow<ChatEvent>();

  return {
    flow: flow,
    emit(message: ChatEvent): void {
      flow.emit(message);
    }
  };
}

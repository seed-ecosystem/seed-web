import {EventsUsecase, ChatEvent} from "@/usecase/chat/events-usecase/events-usecase.ts";
import {mutableSharedFlow} from "@/coroutines/shared-flow.ts";

export function createChatEventsUsecase(): EventsUsecase {
  const flow = mutableSharedFlow<ChatEvent>();

  return {
    flow: flow,
    emit(message: ChatEvent): void {
      flow.emit(message);
    }
  };
}

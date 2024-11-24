import {ChatEventsUsecase, Event} from "@/usecase/events-usecase/chat-events-usecase.ts";
import {mutableSharedFlow} from "@/flow/shared-flow.ts";

export function createChatEventsUsecase(): ChatEventsUsecase {
  const flow = mutableSharedFlow<Event>();

  return {
    flow: flow,
    emit(message: Event): void {
      flow.emit(message);
    }
  };
}

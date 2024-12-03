import {MessagesSnapshotUsecase} from "@/usecase/chat/messages-snapshot-usecase/messages-snapshot-usecase.ts";
import {EventBus} from "@/modules/chat/logic/event-bus.ts";
import {Message} from "@/usecase/chat/message/message.ts";

export function createMessagesSnapshotUsecase(
  {events}: { events: EventBus }
): MessagesSnapshotUsecase {
  let messages: Message[] = [];

  function emit() {
    events.emit({
      type: "messages_snapshot",
      messages: messages
    })
  }

  events.flow.collect((event) => {
    switch (event.type) {
      case "new":
        messages = [event.message, ...messages];
        emit();
        break;
      case "history":
        messages = [...messages, event.message];
        emit();
        break;
      case "edit":
        messages = messages.map((message) =>
          message.nonce == event.nonce ? event.message : message
        );
        emit();
        break;
    }
  });

  return () => messages;
}

import {EventBus} from "@/usecase/chat/event-bus/event-bus.ts";
import {MessageStorage} from "@/persistence/message/message-storage.ts";
import {GetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/get-message-key-usecase.ts";
import {launch} from "@/coroutines/launch.ts";

export interface SaveMessageUsecase {
  (): void;
}

export function saveMessageUsecase(
  {events, messageStorage, getMessageKey}: {
    events: EventBus,
    messageStorage: MessageStorage,
    getMessageKey: GetMessageKeyUsecase
  }
): SaveMessageUsecase {
  return () => {
    events.flow.collect((event) => launch(async () => {
      if (event.type != "save") return;

      const key = await getMessageKey(event.message.nonce.server);
      if (!key) return;

      const message = event.message;

      await messageStorage.add({
        ...message,
        chatId: event.chat.chatId,
        nonce: event.message.nonce.server,
        key: key
      });
    }));
  }
}

import {EventBus} from "@/usecase/chat/event-bus/event-bus.ts";
import {SeedSocket} from "@/api/seed-socket.ts";
import {DecodeMessageUsecase} from "@/usecase/chat/decode-messages-usecase/decode-message-usecase.ts";
import {launch} from "@/coroutines/launch.ts";
import {MessagesSnapshotUsecase} from "@/usecase/chat/messages-snapshot-usecase/messages-snapshot-usecase.ts";
import {MessageStorage} from "@/persistence/message/message-storage.ts";

export interface HandleSocketEventsUsecase {
  (): void;
}

export function handleSocketEventsUsecase(
  {events, socket, decodeMessage, messagesSnapshot, messagesStorage}: {
    events: EventBus;
    socket: SeedSocket;
    decodeMessage: DecodeMessageUsecase;
    messagesSnapshot: MessagesSnapshotUsecase;
    messagesStorage: MessageStorage;
  }
): HandleSocketEventsUsecase {
  return () => {
    socket.events.collect((event) => launch(async () => {
      if (event.type == "new") {
        const message = await decodeMessage(event.message);

        // skip doubling of self-messages
        for (const current of messagesSnapshot()) {
          if ("server" in current.nonce && current.nonce.server == message.nonce.server) {
            return;
          }
        }
        await messagesStorage.add({
          ...message,
          chatId: event.message.chatId,
          nonce: event.message.nonce,
          key: message.key
        });

        events.emit({
          type: "new",
          message: message
        });
      }

      // todo: add check for specific chat
      if (event.type == "wait") {
        events.emit({ type: "loaded" });
      }
    }));
  };
}

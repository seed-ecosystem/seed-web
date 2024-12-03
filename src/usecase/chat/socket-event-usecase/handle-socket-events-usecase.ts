import {EventBus} from "@/modules/chat/logic/event-bus.ts";
import {SeedSocket} from "@/modules/socket/seed-socket.ts";
import {DecodeMessageUsecase} from "@/usecase/chat/decode-messages-usecase/decode-message-usecase.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {MessagesSnapshotUsecase} from "@/usecase/chat/messages-snapshot-usecase/messages-snapshot-usecase.ts";
import {MessageStorage} from "@/modules/chat/persistence/message-storage.ts";

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

        events.emit({
          type: "save",
          chat: event.message,
          message: {
            ...message,
            nonce: { server: event.message.nonce }
          }
        });

        // skip doubling of self-messages
        for (const current of messagesSnapshot()) {
          if ("server" in current.nonce && current.nonce.server == message.nonce.server) {
            return;
          }
        }

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

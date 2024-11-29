import {EventBus} from "@/usecase/chat/event-bus/event-bus.ts";
import {SeedSocket} from "@/api/seed-socket.ts";
import {DecodeMessageUsecase} from "@/usecase/chat/decode-messages-usecase/decode-message-usecase.ts";
import {launch} from "@/coroutines/launch.ts";
import {MessagesSnapshotUsecase} from "@/usecase/chat/messages-snapshot-usecase/messages-snapshot-usecase.ts";

export interface HandleSocketEventsUsecase {
  (): void;
}

export function handleSocketEventsUsecase(
  {events, socket, decodeMessage, messagesSnapshot}: {
    events: EventBus;
    socket: SeedSocket;
    decodeMessage: DecodeMessageUsecase;
    messagesSnapshot: MessagesSnapshotUsecase;
  }
): HandleSocketEventsUsecase {
  return () => {
    socket.events.collect((event) => launch(async () => {
      if (event.type == "new") {
        const message = await decodeMessage(event.message);

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
    }));
  };
}

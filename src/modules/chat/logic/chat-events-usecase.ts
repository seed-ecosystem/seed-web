import {flow, Flow, Subscription} from "@/modules/coroutines/flow.ts";
import {Message} from "@/modules/chat/logic/message.ts";
import {SeedSocket} from "@/modules/socket/seed-socket.ts";
import {DecodeMessageUsecase} from "@/modules/chat/logic/decode-message-usecase.ts";

export type ChatEvent = {
  type: "new";
  messages: Message[];
} | {
  type: "wait";
}

export interface ChatEventsUsecase {
  (): Flow<ChatEvent>
}

export function createChatEventsUsecase(
  {socket, decodeMessage}: {
    socket: SeedSocket;
    decodeMessage: DecodeMessageUsecase;
  }
): ChatEventsUsecase {
  return () => flow(collector => {
    socket.events.collect(event => {
      const accumulated: Message[] = [];
      const loaded = false;

      switch (event.type) {
        case "new":
          const decoded = decodeMessage(event.message);
          if (loaded) {
            collector.emit({ type: "new", messages: [decoded] });
          } else {
            accumulated.push(decoded);
          }
          break;
        case "wait":
          collector.emit({ type: "new", messages: accumulated });
          accumulated.splice(0, accumulated.length);
          collector.emit({ type: "wait" });
          break;
      }
    });
  });
}

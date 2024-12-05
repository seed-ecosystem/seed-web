import {Message} from "@/modules/chat/logic/message.ts";
import {SeedSocket} from "@/modules/socket/seed-socket.ts";
import {DecodeMessageUsecase} from "@/modules/chat/logic/decode-message-usecase.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {Cancellation, Channel, collectAsChannel, createChannel} from "@/modules/coroutines/channel.ts";
import {MutableRefObject, RefObject} from "react";

export type ChatEvent = {
  type: "new";
  messages: Message[];
} | {
  type: "wait";
} | {
  type: "close";
}

export interface ChatEventsUsecase {
  (options: {
    nicknameRef: RefObject<string>;
    localNonceRef: MutableRefObject<number>;
    serverNonceRef: MutableRefObject<number>;
  }): Channel<ChatEvent>
}

export function createChatEventsUsecase(
  {socket, decodeMessage}: {
    socket: SeedSocket;
    decodeMessage: DecodeMessageUsecase;
  }
): ChatEventsUsecase {
  return ({nicknameRef, localNonceRef, serverNonceRef}) => {
    const chatEvents = createChannel<ChatEvent>();
    const socketEvents = collectAsChannel(socket.events);

    const accumulated: Message[] = [];
    let loaded = false;

    launch(async () => {
      for await (const event of socketEvents) {
        if (!chatEvents.isActive) {
          socketEvents.close();
          break;
        }

        switch (event.type) {
          case "new":
            const decoded = await decodeMessage({message: event.message, nicknameRef, localNonceRef});
            if (event.message.nonce <= serverNonceRef.current!) break;
            if (!decoded) {
              throw new Error("Cannot decode message, so can't continue work " + event.message.nonce + " " + serverNonceRef.current);
            }
            serverNonceRef.current = event.message.nonce;
            if (loaded) {
              chatEvents.send({type: "new", messages: [decoded]});
            } else {
              accumulated.unshift(decoded);
            }
            break;
          case "wait":
            chatEvents.send({type: "new", messages: [...accumulated]});
            accumulated.splice(0, accumulated.length);
            chatEvents.send({type: "wait"});
            loaded = true;
            break;
        }
      }
      socketEvents.close();
    });

    return chatEvents;
  };
}

import {Cancellation, Channel, createChannel} from "@/modules/coroutines/channel/channel.ts";
import {Message} from "@/modules/chat/logic/message.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {MessageStorage} from "@/modules/chat/persistence/message-storage.ts";
import {MutableRefObject, Ref, RefObject} from "react";
import {IncrementLocalNonceUsecase} from "@/modules/chat/logic/increment-local-nonce-usecase.ts";

export interface LoadLocalMessagesUsecase {
  (options: {
    nicknameRef: RefObject<string>,
    localNonceRef: MutableRefObject<number>;
    serverNonceRef: MutableRefObject<number>;
  }): Channel<Message[]>
}

export function createLoadLocalMessagesUsecase(
  {messageStorage, chatId, incrementLocalNonce}: {
    incrementLocalNonce: IncrementLocalNonceUsecase;
    messageStorage: MessageStorage,
    chatId: string,
  }
): LoadLocalMessagesUsecase {
  return ({nicknameRef, localNonceRef, serverNonceRef}) => {
    const channel = createChannel<Message[]>();
    launch(async () => {
      const persistenceMessages = await messageStorage.list({chatId})
      const result: Message[] = [];

      for (const message of persistenceMessages) {
        if (message.content.type == "deferred") continue;

        serverNonceRef.current = message.nonce > serverNonceRef.current! ? message.nonce : serverNonceRef.current;

        let common = {
          localNonce: incrementLocalNonce({localNonceRef}),
          serverNonce: message.nonce,
          loading: false,
          failure: false
        }

        if (message.content.type == "regular") {
          result.push({
            ...common,
            content: {
              ...message.content,
              author: nicknameRef.current == message.content.title
            }
          });
        } else {
          result.push({
            ...common,
            content: { type: "unknown" }
          });
        }
      }

      channel.send(result);
      channel.close();
    });
    return channel;
  };
}

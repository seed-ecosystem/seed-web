import {ChatLogic, createChatLogic} from "@/modules/chat/logic/chat-logic.ts";
import {Persistence} from "@/modules/umbrella/persistence/persistence.ts";
import {SeedSocket} from "@/sdk/socket/seed-socket.ts";
import {MessageCoder} from "@/modules/crypto/message-coder.ts";
import {IncrementLocalNonceUsecase} from "@/modules/chat/logic/increment-local-nonce-usecase.ts";
import {ChatListLogic, createChatListLogic} from "@/modules/chat-list/logic/chat-list-logic.ts";
import {SeedClient} from "@/sdk/client/seed-client.ts";

export interface MainLogic {
  chatListLogic: ChatListLogic;
  createChat(options: {chatId: string}): ChatLogic
}

export function createMainLogic(
  {persistence, socket, client, messageCoder, incrementLocalNonce}: {
    persistence: Persistence;
    socket: SeedSocket;
    client: SeedClient;
    messageCoder: MessageCoder;
    incrementLocalNonce: IncrementLocalNonceUsecase;
  }
): MainLogic {
  return {
    chatListLogic: createChatListLogic({persistence}),
    createChat({chatId}): ChatLogic {
      return createChatLogic({
        persistence, socket, messageCoder,
        chatId, incrementLocalNonce, client
      });
    }
  }
}

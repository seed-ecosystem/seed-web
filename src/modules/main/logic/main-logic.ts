import {ChatLogic, createChatLogic} from "@/modules/chat/logic/chat-logic.ts";
import {Persistence} from "@/modules/umbrella/persistence/persistence.ts";
import {SeedSocket} from "@/modules/socket/seed-socket.ts";
import {MessageCoder} from "@/modules/crypto/message-coder.ts";
import {IncrementLocalNonceUsecase} from "@/modules/chat/logic/increment-local-nonce-usecase.ts";
import {ChatListLogic, createChatListLogic} from "@/modules/chat-list/logic/chat-list-logic.ts";

export interface MainLogic {
  chatListLogic: ChatListLogic;
  createChat(): ChatLogic
}

export function createMainLogic(
  {persistence, socket, messageCoder, chatId, incrementLocalNonce}: {
    persistence: Persistence;
    socket: SeedSocket;
    messageCoder: MessageCoder;
    chatId: string;
    incrementLocalNonce: IncrementLocalNonceUsecase;
  }
): MainLogic {
  return {
    chatListLogic: createChatListLogic({persistence}),
    createChat(): ChatLogic {
      return createChatLogic({
        persistence, socket, messageCoder, chatId, incrementLocalNonce
      });
    }
  }
}

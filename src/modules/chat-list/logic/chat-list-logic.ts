import {ChatLogic, createChatLogic} from "@/modules/chat/logic/chat-logic.ts";
import {Persistence} from "@/modules/umbrella/persistence/persistence.ts";
import {SeedSocket} from "@/modules/socket/seed-socket.ts";
import {MessageCoder} from "@/modules/crypto/message-coder.ts";
import {IncrementLocalNonceUsecase} from "@/modules/chat/logic/increment-local-nonce-usecase.ts";

export interface ChatListLogic {
  createChat(): ChatLogic
}

export function createChatListLogic(
  {persistence, socket, messageCoder, chatId, incrementLocalNonce}: {
    persistence: Persistence;
    socket: SeedSocket;
    messageCoder: MessageCoder;
    chatId: string;
    incrementLocalNonce: IncrementLocalNonceUsecase;
  }
): ChatListLogic {
  return {
    createChat(): ChatLogic {
      return createChatLogic({
        persistence, socket, messageCoder, chatId, incrementLocalNonce
      });
    }
  }
}

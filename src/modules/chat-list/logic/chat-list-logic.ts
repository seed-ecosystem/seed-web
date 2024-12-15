import {
  createLoadLocalChatsUsecase,
  LoadLocalChatsUsecase
} from "@/modules/chat-list/logic/load-local-chats-usecase.ts";
import {Persistence} from "@/modules/umbrella/persistence/persistence.ts";

export interface ChatListLogic {
  loadLocalChats: LoadLocalChatsUsecase;
}

export function createChatListLogic(
  {persistence}: {
    persistence: Persistence;
  }
): ChatListLogic {
  const {chat: chatStorage, message: messageStorage} = persistence;

  return {
    loadLocalChats: createLoadLocalChatsUsecase({chatStorage, messageStorage})
  };
}

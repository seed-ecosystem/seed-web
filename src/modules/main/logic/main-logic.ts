import {ChatLogic, createChatLogic} from "@/modules/chat/logic/chat-logic.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {ChatListLogic, createChatListLogic} from "@/modules/chat-list/logic/chat-list-logic.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";

export interface MainLogic {
  chatListLogic: ChatListLogic;
  createChat(options: {chatId: string}): ChatLogic
}

export function createMainLogic(
  {persistence, worker}: {
    persistence: SeedPersistence;
    worker: WorkerStateHandle;
  }
 ): MainLogic {
  return {
    chatListLogic: createChatListLogic({persistence}),
    createChat({chatId}): ChatLogic {
      return createChatLogic({persistence, worker, chatId});
    }
  }
}

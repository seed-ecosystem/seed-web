import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";

import {Cancellation} from "@/coroutines/cancellation.ts";
import {ChatListStateHandle} from "@/modules/main/chat-list/logic/chat-list-state-handle.ts";

export type UpdateLastMessageOptions = {
  persistence: SeedPersistence;
  worker: WorkerStateHandle;
  chatListStateHandle: ChatListStateHandle;
}

export function updateLastMessage(
  {
    persistence, worker, chatListStateHandle
  }: UpdateLastMessageOptions
): Cancellation {
  const channel = worker.events.subscribeAsChannel();

  channel.onEach(async (event) => {
    if (event.type != "new") return;
    const message = event.messages[event.messages.length - 1];
    await persistence.chat.updateLastMessageDate(message.chatId, new Date());
    const chats = [...chatListStateHandle.get()];
    for (let i = 0; i < chats.length; i++) {
      const chat = chats[i];
      if (chat.id != message.chatId) continue;
      chats.splice(i, 1);
      if (message.content.type == "regular") {
        chat.lastMessage = message.content;
      }
      chats.unshift(chat);
      break;
    }
    chatListStateHandle.set(chats);
  });

  return channel.close;
}

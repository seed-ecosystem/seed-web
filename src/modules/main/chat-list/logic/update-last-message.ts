import {Cancellation} from "@/coroutines/cancellation.ts";
import {ChatListStateHandle} from "@/modules/main/chat-list/logic/chat-list-state-handle.ts";
import {WorkerAdapter} from "@/worker/worker-adapter.ts";

export type UpdateLastMessageOptions = {
  worker: WorkerAdapter;
  chatListStateHandle: ChatListStateHandle;
}

export function updateLastMessage(
  {
    worker, chatListStateHandle
  }: UpdateLastMessageOptions
): Cancellation {
  const channel = worker.events.subscribeAsChannel();

  channel.onEach(async (event) => {
    if (event.type != "new") return;
    const message = event.messages[event.messages.length - 1];
    const content = message.content.type == "regular" ? message.content : undefined;
    chatListStateHandle.popUp(message.chatId, content, event.messages.length);
  });

  return channel.close;
}

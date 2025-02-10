import { WorkerStateHandle } from "@/modules/umbrella/logic/worker-state-handle.ts";
import { Cancellation } from "@/coroutines/cancellation.ts";
import { ChatListStateHandle } from "@/modules/main/chat-list/logic/chat-list-state-handle.ts";

export type UpdateLastMessageOptions = {
  worker: WorkerStateHandle;
  chatListStateHandle: ChatListStateHandle;
}

export function updateLastMessage(
  {
    worker, chatListStateHandle,
  }: UpdateLastMessageOptions,
): Cancellation {
  const channel = worker.events.subscribeAsChannel();

  channel.onEach((event) => {
    if (event.type != "new") return;
    const message = event.messages[event.messages.length - 1];
    const content = message.content.type == "regular" ? message.content : undefined;
    chatListStateHandle.popUp(message.queueId, content, event.messages.length);
  });

  return () => { channel.close(); };
}

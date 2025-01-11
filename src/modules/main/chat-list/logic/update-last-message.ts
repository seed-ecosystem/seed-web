import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";

import {Cancellation} from "@/coroutines/cancellation.ts";

export type UpdateLastMessageOptions = {
  persistence: SeedPersistence;
  worker: WorkerStateHandle;
}

export function updateLastMessage(
  {
    persistence, worker
  }: UpdateLastMessageOptions
): Cancellation {
  const channel = worker.events.subscribeAsChannel();

  channel.onEach(async (event) => {
    if (event.type != "new") return;
    const message = event.messages[event.messages.length - 1];
    await persistence.chat.updateLastMessageDate(message.chatId, new Date());
  });

  return channel.close;
}

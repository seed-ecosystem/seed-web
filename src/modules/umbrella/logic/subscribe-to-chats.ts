import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {SeedWorker} from "@/sdk/worker/seed-worker.ts";
import {launch} from "@/coroutines/launch.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";

export type SubscribeToChatsOptions = {
  persistence: SeedPersistence;
  worker: WorkerStateHandle;
};

export function subscribeToChats(
  {persistence, worker}: SubscribeToChatsOptions
) {
  worker.events.subscribeAsChannel().onEach(async (event) => {
    if (event.type != "connected") return;
    if (!event.value) return;
    const chats = await persistence.chat.list();
    for (const chat of chats) {
      const lastMessage = await persistence.message.lastMessage({chatId: chat.id});
      let nonce;
      if (lastMessage) {
        nonce = lastMessage.nonce + 1;
      } else {
        nonce = chat.initialNonce;
      }
      launch(async () => worker.subscribe({ chatId: chat.id, nonce }));
    }
  });
}

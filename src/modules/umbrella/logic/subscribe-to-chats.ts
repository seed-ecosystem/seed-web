import {SeedPersistence} from "@/worker/persistence/seed-persistence.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {WorkerAdapter} from "@/worker/worker-adapter.ts";

export type SubscribeToChatsOptions = {
  persistence: SeedPersistence;
  worker: WorkerAdapter;
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

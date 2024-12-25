import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {SeedWorker} from "@/sdk/worker/seed-worker.ts";

export type SubscribeToChatsOptions = {
  persistence: SeedPersistence;
  worker: SeedWorker;
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
      await worker.subscribe({ chatId: chat.id, nonce: lastMessage ? (lastMessage.nonce + 1) : 0 });
    }
  });
}

import { SeedPersistence } from "@/modules/umbrella/persistence/seed-persistence.ts";
import { launch } from "@/coroutines/launch.ts";
import { WorkerStateHandle } from "@/modules/umbrella/logic/worker-state-handle.ts";

export type SubscribeToChatsOptions = {
  persistence: SeedPersistence;
  worker: WorkerStateHandle;
};

export function subscribeToChats(
  { persistence, worker }: SubscribeToChatsOptions,
) {
  launch(async () => {
    const chats = await persistence.chat.list();
    for (const chat of chats) {
      const lastMessage = await persistence.message.lastMessage({
        url: chat.serverUrl,
        queueId: chat.id,
      });
      let nonce;
      if (lastMessage) {
        nonce = lastMessage.nonce + 1;
      } else {
        nonce = chat.initialNonce;
      }
      worker.subscribe(chat.serverUrl, { queueId: chat.id, nonce });
    }
  });
}


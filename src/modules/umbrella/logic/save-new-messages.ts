import {SeedWorker} from "@/sdk/worker/seed-worker.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";

export type SaveNewMessagesOptions = {
  persistence: SeedPersistence;
  worker: SeedWorker;
}

export function saveNewMessages({persistence, worker}: SaveNewMessagesOptions) {
  worker.events.subscribeAsChannel().onEach(async (event) => {
    switch (event.type) {
      case "new":
        await persistence.message.add(event.message);
        break;
    }
  });
}
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {randomAESKey} from "@/sdk/crypto/subtle-crypto.ts";
import {worker} from "globals";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";

export type CreateChatEvent = {
  type: "title";
  value: string;
} | {
  type: "open";
  chatId: string;
} | {
  type: "close";
}

export interface CreateChatLogic {
  events: Observable<CreateChatEvent>;

  getTitle(): string;
  setTitle(value: string): void;

  create(): void;
  cancel(): void;
}

export function createCreateChatLogic(
  {persistence, worker}: {
    persistence: SeedPersistence;
    worker: WorkerStateHandle;
  }
): CreateChatLogic {
  const events: Observable<CreateChatEvent> = createObservable();

  let title = "";
  let blocked = false;

  function setTitle(value: string) {
    title = value;
    events.emit({ type: "title", value });
  }

  return {
    events,

    getTitle: () => title, setTitle,

    create() {
      if (blocked) return;
      blocked = true;
      launch(async () => {
        const privateKey = await randomAESKey();
        const chatId = await randomAESKey();
        await persistence.chat.add({
          id: chatId,
          title: title,
          initialKey: privateKey,
          initialNonce: 0
        });
        events.emit({ type: "open", chatId });
        worker.subscribe({ chatId, nonce: 0 });
      });
    },

    cancel() {
      if (blocked) return;
      blocked = true;
      events.emit({ type: "close" });
    }
  };
}

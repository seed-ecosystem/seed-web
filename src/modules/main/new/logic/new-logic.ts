import {createObservable, Observable} from "@/coroutines/observable.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {randomAESKey} from "@/sdk/crypto/subtle-crypto.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {NewStateHandle} from "@/modules/main/logic/new-state-handle.ts";

export type NewEvent = {
  type: "title";
  value: string;
} | {
  type: "openChat";
  chatId: string;
}

export interface NewLogic {
  events: Observable<NewEvent>;

  getTitle(): string;
  setTitle(value: string): void;

  create(): void;
  cancel(): void;
}

export function createNewLogic(
  {persistence, worker, newStateHandle}: {
    persistence: SeedPersistence;
    worker: WorkerStateHandle;
    newStateHandle: NewStateHandle;
  }
): NewLogic {
  const events: Observable<NewEvent> = createObservable();

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
        if (title.trim().length == 0) return;
        const privateKey = await randomAESKey();
        const chatId = await randomAESKey();
        await persistence.chat.add({
          id: chatId,
          title: title,
          initialKey: privateKey,
          initialNonce: 0,
          lastMessageDate: new Date(),
        });
        events.emit({ type: "openChat", chatId });
        worker.subscribe({ chatId, nonce: 0 });
        newStateHandle.setShown(false);
      });
    },

    cancel() {
      if (blocked) return;
      blocked = true;
      newStateHandle.setShown(false);
    }
  };
}

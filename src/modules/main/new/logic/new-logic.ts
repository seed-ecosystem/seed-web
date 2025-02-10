import { createObservable, Observable } from "@/coroutines/observable.ts";
import { SeedPersistence } from "@/modules/umbrella/persistence/seed-persistence.ts";
import { launch } from "@/coroutines/launch.ts";
import { WorkerStateHandle } from "@/modules/umbrella/logic/worker-state-handle.ts";
import { NewStateHandle } from "@/modules/main/logic/new-state-handle.ts";
import { ChatListStateHandle } from "@/modules/main/chat-list/logic/chat-list-state-handle.ts";
import {
  BackendSelectorLogic, BackendSelectorOptionLogic,
  createBackendSelectorLogic,
} from "@/modules/main/new/select-backend/logic/backend-selector-logic.ts";
import { randomAESKey } from "@/crypto/subtle";

export type NewEvent = {
  type: "title";
  value: string;
} | {
  type: "openChat";
  chatId: string;
}

export interface NewLogic {
  events: Observable<NewEvent>;

  selector: BackendSelectorLogic;

  getTitle(): string;
  setTitle(value: string): void;

  create(): void;
  cancel(): void;
}

export function createNewLogic(
  { persistence, worker, newStateHandle, chatListStateHandle }: {
    persistence: SeedPersistence;
    worker: WorkerStateHandle;
    newStateHandle: NewStateHandle;
    chatListStateHandle: ChatListStateHandle;
  },
): NewLogic {
  const events: Observable<NewEvent> = createObservable();

  const selector = createBackendSelectorLogic();

  let title = "";
  let blocked = false;

  function setTitle(value: string) {
    title = value;
    events.emit({ type: "title", value });
  }

  return {
    events,

    selector,

    getTitle: () => title, setTitle,

    create() {
      if (blocked) return;
      if (title.trim().length == 0) return;
      const option = selector.getOption();
      if (option.type === "custom" && getServerUrl(option).trim().length == 0) return;
      blocked = true;
      launch(async () => {
        const privateKey = await randomAESKey();
        const chatId = await randomAESKey();
        const serverUrl = getServerUrl(option);
        const chat = {
          id: chatId,
          title: title,
          initialKey: privateKey,
          initialNonce: 0,
          lastMessageDate: new Date(),
          unreadCount: 0,
          serverUrl,
        };
        await persistence.chat.put(chat);
        events.emit({ type: "openChat", chatId });
        worker.subscribe(serverUrl, { queueId: chatId, nonce: 0 });
        chatListStateHandle.unshift(chat);
        newStateHandle.setShown(false);
      });
    },

    cancel() {
      if (blocked) return;
      blocked = true;
      newStateHandle.setShown(false);
    },
  };
}

function getServerUrl(option: BackendSelectorOptionLogic): string {
  switch (option.type) {
    case "go":
      return "wss://meetacy.app/seed-go";
    case "kt":
      return "wss://meetacy.app/seed-kt";
    case "custom":
      return option.getValue();
  }
}

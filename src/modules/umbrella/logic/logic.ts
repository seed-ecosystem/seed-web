import {createPersistence} from "@/worker/persistence/seed-persistence.ts";
import {createMainLogic, MainLogic} from "@/modules/main/logic/main-logic.ts";
import {Chat} from "@/worker/persistence/chat-list/chat.ts";
import {subscribeToChats} from "@/modules/umbrella/logic/subscribe-to-chats.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {createChatListStateHandle} from "@/modules/main/chat-list/logic/chat-list-state-handle.ts";
import {pickRandomNickname} from "@/modules/umbrella/logic/pick-random-nickname.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {createChatStateHandle} from "@/modules/main/logic/chat-state-handle.ts";
import {createWorkerAdapter} from "@/worker/worker-adapter.ts";

export type LogicEvent = {
  type: "open",
  chatId: string;
}

export interface Logic {
  events: Observable<LogicEvent>
  importChat(chat: Chat): void;
  createMain(): MainLogic;
}

export async function createLogic(): Promise<Logic> {
  const events: Observable<LogicEvent> = createObservable();
  const persistence = await createPersistence();
  const worker = createWorkerAdapter();
  const chatStateHandle = createChatStateHandle();
  const chatListStateHandle = createChatListStateHandle({persistence, chatStateHandle});

  await pickRandomNickname({persistence});
  subscribeToChats({persistence, worker});

  return {
    events,
    importChat(chat: Chat) {
      launch(async () => {
        const exists = await persistence.chat.exists(chat.id);
        if (exists) {
          events.emit({ type: "open", chatId: chat.id });
          return;
        }
        worker.subscribe({ chatId: chat.id, nonce: chat.initialNonce });
        await persistence.chat.put(chat);
        chatListStateHandle.unshift(chat);
        events.emit({ type: "open", chatId: chat.id });
      });
    },
    createMain: () => createMainLogic({persistence, worker, chatListStateHandle, chatStateHandle})
  };
}

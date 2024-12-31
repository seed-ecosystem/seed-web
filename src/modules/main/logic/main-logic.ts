import {ChatLogic, createChatLogic} from "@/modules/chat/logic/chat-logic.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {ChatListLogic, createChatListLogic} from "@/modules/chat-list/logic/chat-list-logic.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {createNicknameStateHandle} from "@/modules/main/logic/nickname-state-handle.ts";
import {loadNickname} from "@/modules/main/logic/load-nickname.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";

export type MainEvent = {
  type: "loading";
  value: boolean;
}

export interface MainLogic {
  chatListLogic: ChatListLogic;
  createChat(options: {chatId: string}): Promise<ChatLogic>;

  events: Observable<MainEvent>;
  getLoading(): boolean;
}

export function createMainLogic(
  {persistence, worker}: {
    persistence: SeedPersistence;
    worker: WorkerStateHandle;
  }
 ): MainLogic {
  const events: Observable<MainEvent> = createObservable();

  let nickname = createNicknameStateHandle({persistence});

  const chatListLogic = createChatListLogic({nickname, persistence});

  worker.events.subscribe(event => {
    switch (event.type) {
      case "connected":
        events.emit({ type: "loading", value: !event.value });
        break;
    }
  });

  loadNickname({persistence, nickname});

  return {
    chatListLogic,
    createChat: ({chatId}) =>
      createChatLogic({persistence, worker, chatId, nickname}),

    events,
    getLoading: () => !worker.isConnected()
  }
}

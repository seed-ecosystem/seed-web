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
} | {
  type: "chat";
  value?: ChatLogic;
} | {
  type: "closeChat";
}

export interface MainLogic {
  chatListLogic: ChatListLogic;

  events: Observable<MainEvent>;
  getLoading(): boolean;
  getChat(): ChatLogic | undefined;

  openChat(options: {chatId: string}): void;
  closeChat(): void;
}

export function createMainLogic(
  {persistence, worker}: {
    persistence: SeedPersistence;
    worker: WorkerStateHandle;
  }
 ): MainLogic {
  const events: Observable<MainEvent> = createObservable();

  let nickname = createNicknameStateHandle({persistence});
  let chat: ChatLogic | undefined;
  let chatListLogic = createChatListLogic({nickname, persistence});

  function setChat(value?: ChatLogic) {
    chat = value;
    events.emit({ type: "chat", value: value });
    if (value == undefined) {
      events.emit({ type: "closeChat" });
    }
  }

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

    events,
    getLoading: () => !worker.isConnected(),
    getChat: () => chat,

    openChat: ({chatId}) => createChatLogic({persistence, worker, chatId, nickname}).then(setChat),
    closeChat: () => setChat(undefined),
  }
}

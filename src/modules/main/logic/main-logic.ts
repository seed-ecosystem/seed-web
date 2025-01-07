import {ChatLogic, createChatLogic} from "@/modules/chat/logic/chat-logic.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {ChatListLogic, createChatListLogic} from "@/modules/chat-list/logic/chat-list-logic.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {createNicknameStateHandle} from "@/modules/main/logic/nickname-state-handle.ts";
import {loadNickname} from "@/modules/main/logic/load-nickname.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {createTopBarLogic, TopBarLogic} from "@/modules/top-bar/logic/top-bar-logic.ts";
import {CreateChatLogic, createCreateChatLogic} from "@/modules/new-chat/logic/create-chat-logic.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {createChatTopBarLogic} from "@/modules/top-bar/logic/chat/chat-top-bar-logic.ts";
import {createChatStateHandle} from "@/modules/main/logic/chat-state-handle.ts";

export type MainEvent = {
  type: "chat";
  value?: ChatLogic;
} | {
  type: "createChat";
  value?: CreateChatLogic;
}

export interface MainLogic {
  events: Observable<MainEvent>;

  getTopBar(): TopBarLogic;
  getChatList(): ChatListLogic;
  getChat(): ChatLogic | undefined;
  getCreateChat(): CreateChatLogic | undefined;

  openChat(options: {chatId: string}): void;
  closeChat(): void;
  openCreateChat(): void;
  closeCreateChat(): void;

  escape(): void;
}

export function createMainLogic(
  {persistence, worker}: {
    persistence: SeedPersistence;
    worker: WorkerStateHandle;
  }
 ): MainLogic {
  const events: Observable<MainEvent> = createObservable();

  const nicknameStateHandle = createNicknameStateHandle({persistence});
  const chatStateHandle = createChatStateHandle();
  const topBar = createTopBarLogic({worker, nicknameStateHandle, chatStateHandle});
  const chatList = createChatListLogic({persistence});

  let chat: ChatLogic | undefined;
  let createChat: CreateChatLogic | undefined;

  function setChat(value?: ChatLogic) {
    chat = value;
    events.emit({ type: "chat", value });
  }

  function setCreateChat(value?: CreateChatLogic) {
    createChat = value;
    events.emit({ type: "createChat", value });
  }

  chatStateHandle.updates.subscribe(chat => {
    if (!chat) {
      setChat(undefined);
      return;
    }
    const {chatId, title} = chat;
    const chatLogic = createChatLogic({persistence, worker, chatId, nicknameStateHandle, title});
    setChat(chatLogic);
  });

  loadNickname({persistence, nickname: nicknameStateHandle});

  return {
    events,

    getTopBar: () => topBar,
    getChatList: () => chatList,
    getChat: () => chat,
    getCreateChat: () => createChat,

    openChat: ({chatId}) => launch(async () => {
      const chat = await persistence.chat.get(chatId);
      chatStateHandle.set({chatId: chat.id, title: chat.title});
    }),
    closeChat: () => chatStateHandle.set(undefined),
    openCreateChat: () => {
      const createChat = createCreateChatLogic({persistence, worker});
      setCreateChat(createChat);
    },
    closeCreateChat: () => setCreateChat(undefined),

    escape() {
      if (createChat !== undefined) {
        setCreateChat(undefined);
      } else {
        setChat(undefined);
      }
    }
  }
}

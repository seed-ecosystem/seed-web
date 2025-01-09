import {ChatLogic, createChatLogic} from "@/modules/main/chat/logic/chat-logic.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {ChatListLogic, createChatListLogic} from "@/modules/main/chat-list/logic/chat-list-logic.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {createNicknameStateHandle} from "@/modules/main/logic/nickname-state-handle.ts";
import {loadNickname} from "@/modules/main/logic/load-nickname.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {createTopBarLogic, TopBarLogic} from "@/modules/main/top-bar/logic/top-bar-logic.ts";
import {NewLogic, createNewLogic} from "@/modules/main/new/logic/new-logic.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {createChatStateHandle} from "@/modules/main/logic/chat-state-handle.ts";
import {createShareChatLogic, ShareChatLogic} from "@/modules/main/share/logic/share-chat-logic.ts";
import {createShareStateHandle} from "@/modules/main/logic/share-state-handle.ts";
import {createNewStateHandle} from "@/modules/main/logic/new-state-handle.ts";

export type MainEvent = {
  type: "chat";
  value?: ChatLogic;
} | {
  type: "new";
  value?: NewLogic;
} | {
  type: "share";
  value?: ShareChatLogic;
}

export interface MainLogic {
  events: Observable<MainEvent>;

  getTopBar(): TopBarLogic;
  getChatList(): ChatListLogic;
  getChat(): ChatLogic | undefined;
  getCreateChat(): NewLogic | undefined;
  getShareChat(): ShareChatLogic | undefined;

  bindChat(chatId?: string): void;

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
  const shareStateHandle = createShareStateHandle();
  const newStateHandle = createNewStateHandle();

  const topBar = createTopBarLogic({
    worker,
    nicknameStateHandle, chatStateHandle,
    shareStateHandle, newStateHandle
  });
  const chatList = createChatListLogic({persistence});

  let chat: ChatLogic | undefined;
  let createChat: NewLogic | undefined;
  let shareChat: ShareChatLogic | undefined;

  function setChat(value?: ChatLogic) {
    chat = value;
    events.emit({ type: "chat", value });
  }

  function setNew(value?: NewLogic) {
    createChat = value;
    events.emit({type: "new", value});
  }

  function setShare(value?: ShareChatLogic) {
    shareChat = value;
    events.emit({type: "share", value});
  }

  chatStateHandle.updates.subscribe(chat => {
    if (!chat) {
      setChat(undefined);
      return;
    }
    const {chatId} = chat;
    const chatLogic = createChatLogic({persistence, worker, chatId, nicknameStateHandle});
    setChat(chatLogic);
  });

  shareStateHandle.updates.subscribe(props => {
    setShare(props.shown ? createShareChatLogic({shareStateHandle, persistence, chatId: props.chatId}) : undefined);
  });
  newStateHandle.updates.subscribe(shown => {
    setNew(shown ? createNewLogic({persistence, worker, newStateHandle}) : undefined);
  });

  loadNickname({persistence, nickname: nicknameStateHandle});

  return {
    events,

    getTopBar: () => topBar,
    getChatList: () => chatList,
    getChat: () => chat,
    getCreateChat: () => createChat,
    getShareChat: () => shareChat,

    bindChat: (chatId) => launch(async () => {
      if (!chatId) {
        chatStateHandle.set(undefined);
        return;
      }
      const chat = await persistence.chat.get(chatId);
      chatStateHandle.set({chatId: chat.id, title: chat.title});
    }),

    // this of moving this into dialogs
    escape() {
      if (createChat !== undefined) {
        setNew(undefined);
      } else if (shareChat !== undefined) {
        setShare(undefined);
      } else {
        setChat(undefined);
      }
    }
  }
}

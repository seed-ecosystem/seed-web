import { ChatLogic, createChatLogic } from "@/modules/main/chat/logic/chat-logic.ts";
import { SeedPersistence } from "@/modules/umbrella/persistence/seed-persistence.ts";
import { ChatListLogic, createChatListLogic } from "@/modules/main/chat-list/logic/chat-list-logic.ts";
import { WorkerStateHandle } from "@/modules/umbrella/logic/worker-state-handle.ts";
import { createNicknameStateHandle } from "@/modules/main/logic/nickname-state-handle.ts";
import { loadNickname } from "@/modules/main/logic/load-nickname.ts";
import { createObservable, Observable } from "@/coroutines/observable.ts";
import { createTopBarLogic, TopBarLogic } from "@/modules/main/top-bar/logic/top-bar-logic.ts";
import { NewLogic, createNewLogic } from "@/modules/main/new/logic/new-logic.ts";
import { launch } from "@/coroutines/launch.ts";
import { ChatStateHandle } from "@/modules/main/logic/chat-state-handle.ts";
import { createShareChatLogic, ShareChatLogic } from "@/modules/main/share/logic/share-chat-logic.ts";
import { createShareStateHandle } from "@/modules/main/logic/share-state-handle.ts";
import { createNewStateHandle } from "@/modules/main/logic/new-state-handle.ts";
import { ChatListStateHandle } from "@/modules/main/chat-list/logic/chat-list-state-handle.ts";
import { createDeleteStateHandle } from "@/modules/main/logic/delete-state-handle.ts";
import { createDeleteLogic, DeleteLogic } from "@/modules/main/delete/logic/delete-logic.ts";
import { createRenameStateHandle } from "@/modules/main/logic/rename-state-handle.ts";
import { createRenameLogic, RenameLogic } from "@/modules/main/rename/logic/rename-logic.ts";

export type MainEvent = {
  type: "chat";
  value?: ChatLogic;
} | {
  type: "new";
  value?: NewLogic;
} | {
  type: "share";
  value?: ShareChatLogic;
} | {
  type: "delete";
  value?: DeleteLogic;
} | {
  type: "rename";
  value?: RenameLogic;
}

export interface MainLogic {
  events: Observable<MainEvent>;

  getTopBar(): TopBarLogic;
  getChatList(): ChatListLogic;
  getChat(): ChatLogic | undefined;
  getCreateChat(): NewLogic | undefined;
  getShareChat(): ShareChatLogic | undefined;
  getDeleteChat(): DeleteLogic | undefined;
  getRenameChat(): RenameLogic | undefined;

  bindChat(chatId?: string): void;

  escape(): void;
}

export function createMainLogic(
  { persistence, worker, chatListStateHandle, chatStateHandle }: {
    persistence: SeedPersistence;
    worker: WorkerStateHandle;
    chatListStateHandle: ChatListStateHandle;
    chatStateHandle: ChatStateHandle;
  },
): MainLogic {
  const events: Observable<MainEvent> = createObservable();

  const nicknameStateHandle = createNicknameStateHandle({ persistence });
  const shareStateHandle = createShareStateHandle();
  const newStateHandle = createNewStateHandle();
  const deleteStateHandle = createDeleteStateHandle();
  const renameStateHandle = createRenameStateHandle();

  const topBar = createTopBarLogic({
    worker,
    nicknameStateHandle, chatStateHandle,
    shareStateHandle, newStateHandle, deleteStateHandle, renameStateHandle,
  });
  const chatList = createChatListLogic({ persistence, worker, chatListStateHandle });

  let chat: ChatLogic | undefined;
  let createChat: NewLogic | undefined;
  let shareChat: ShareChatLogic | undefined;
  let deleteChat: DeleteLogic | undefined;
  let renameChat: RenameLogic | undefined;

  function setChat(value?: ChatLogic) {
    chat = value;
    events.emit({ type: "chat", value });
  }

  function setNew(value?: NewLogic) {
    createChat = value;
    events.emit({ type: "new", value });
  }

  function setShare(value?: ShareChatLogic) {
    shareChat = value;
    events.emit({ type: "share", value });
  }

  function setDelete(value?: DeleteLogic) {
    deleteChat = value;
    events.emit({ type: "delete", value });
  }

  function setRename(value?: RenameLogic) {
    renameChat = value;
    events.emit({ type: "rename", value });
  }

  chatStateHandle.updates.subscribe(chat => {
    if (!chat) {
      setChat(undefined);
      return;
    }
    const { queueId, url } = chat;
    const chatLogic = createChatLogic({ url, persistence, worker, queueId, nicknameStateHandle, chatListStateHandle });
    setChat(chatLogic);
  });

  shareStateHandle.updates.subscribe(props => {
    setShare(props.shown ? createShareChatLogic({ shareStateHandle, persistence, chatId: props.chatId }) : undefined);
  });
  deleteStateHandle.updates.subscribe(props => {
    setDelete(props.shown ? createDeleteLogic({ deleteStateHandle, chatListStateHandle, chatStateHandle, chatId: props.chatId }) : undefined);
  });
  renameStateHandle.updates.subscribe(props => {
    setRename(props.shown ? createRenameLogic({ renameStateHandle, chatListStateHandle, chatStateHandle, chatId: props.chatId, title: props.title }) : undefined);
  });
  newStateHandle.updates.subscribe(shown => {
    setNew(shown ? createNewLogic({ persistence, worker, newStateHandle, chatListStateHandle }) : undefined);
  });

  loadNickname({ persistence, nickname: nicknameStateHandle });

  return {
    events,

    getTopBar: () => topBar,
    getChatList: () => chatList,
    getChat: () => chat,
    getCreateChat: () => createChat,
    getShareChat: () => shareChat,
    getDeleteChat: () => deleteChat,
    getRenameChat: () => renameChat,

    bindChat: (chatId) => {
      launch(async () => {
        if (!chatId) {
          chatStateHandle.set(undefined);
          return;
        }
        const chat = await persistence.chat.get(chatId);
        if (!chat) return;
        chatStateHandle.set({
          url: chat.serverUrl,
          queueId: chat.id,
          title: chat.title,
        });
      });
    },

    // this of moving this into dialogs
    escape() {
      if (createChat !== undefined) {
        setNew(undefined);
      } else if (shareChat !== undefined) {
        setShare(undefined);
      } else if (deleteChat !== undefined) {
        setDelete(undefined);
      } else if (renameChat !== undefined) {
        setRename(undefined);
      } else {
        setChat(undefined);
      }
    },
  };
}

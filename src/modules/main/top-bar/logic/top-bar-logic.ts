import { createObservable, Observable } from "@/coroutines/observable.ts";
import { WorkerStateHandle } from "@/modules/umbrella/logic/worker-state-handle.ts";
import {
  ChatListTopBarLogic,
  createChatListTopBarLogic,
} from "@/modules/main/top-bar/logic/chat-list/chat-list-top-bar-logic.ts";
import { ChatTopBarLogic, createChatTopBarLogic } from "@/modules/main/top-bar/logic/chat/chat-top-bar-logic.ts";
import { NicknameStateHandle } from "@/modules/main/logic/nickname-state-handle.ts";
import { ChatStateHandle } from "@/modules/main/logic/chat-state-handle.ts";
import { ShareStateHandle } from "@/modules/main/logic/share-state-handle.ts";
import { NewStateHandle } from "@/modules/main/logic/new-state-handle.ts";
import { DeleteStateHandle } from "@/modules/main/logic/delete-state-handle.ts";
import { RenameStateHandle } from "@/modules/main/logic/rename-state-handle.ts";

export type TopBarEvent = {
  type: "connecting";
  value: boolean;
} | {
  type: "chat";
  value?: ChatTopBarLogic;
};

export interface TopBarLogic {
  events: Observable<TopBarEvent>;

  getChatList: () => ChatListTopBarLogic;
  getChat: () => ChatTopBarLogic | undefined;
  getConnecting: () => boolean;
}

export function createTopBarLogic(
  { worker, nicknameStateHandle, chatStateHandle, shareStateHandle, newStateHandle, deleteStateHandle, renameStateHandle }: {
    worker: WorkerStateHandle;
    nicknameStateHandle: NicknameStateHandle;
    chatStateHandle: ChatStateHandle;
    shareStateHandle: ShareStateHandle;
    newStateHandle: NewStateHandle;
    deleteStateHandle: DeleteStateHandle;
    renameStateHandle: RenameStateHandle;
  },
): TopBarLogic {
  const chatList = createChatListTopBarLogic({ nicknameStateHandle, newStateHandle });

  const events: Observable<TopBarEvent> = createObservable();
  let chat: ChatTopBarLogic | undefined;

  function setChat(value?: ChatTopBarLogic) {
    chat = value;
    events.emit({ type: "chat", value: chat });
  }

  worker.events.subscribe(event => {
    switch (event.type) {
      case "connected":
        events.emit({ type: "connecting", value: !event.connected });
        break;
    }
  });

  chatStateHandle.updates.subscribe(chat => {
    if (!chat) {
      setChat(undefined);
      return;
    }
    const { queueId, title, url } = chat;
    const value = createChatTopBarLogic(
      {
        worker,
        url,
        queueId,
        title,
        chatStateHandle,
        shareStateHandle,
        deleteStateHandle,
        renameStateHandle,
      },
    );
    setChat(value);
  });

  return {
    events,

    getChatList: () => chatList,
    getChat: () => chat,
    getConnecting: () => !worker.getConnected(),
  };
}

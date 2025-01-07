import {createObservable, Observable} from "@/coroutines/observable.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {
  ChatListTopBarLogic,
  createChatListTopBarLogic
} from "@/modules/top-bar/logic/chat-list/chat-list-top-bar-logic.ts";
import {ChatTopBarLogic, createChatTopBarLogic} from "@/modules/top-bar/logic/chat/chat-top-bar-logic.ts";
import {NicknameStateHandle} from "@/modules/main/logic/nickname-state-handle.ts";
import {ChatListTopBarProps} from "@/modules/top-bar/components/chat-list/chat-list-top-bar-content.tsx";
import {ChatStateHandle} from "@/modules/main/logic/chat-state-handle.ts";

export type TopBarEvent = {
  type: "connecting";
  value: boolean;
} | {
  type: "chat";
  value?: ChatTopBarLogic;
};

export interface TopBarLogic {
  events: Observable<TopBarEvent>;

  getChatList(): ChatListTopBarLogic;
  getChat(): ChatTopBarLogic | undefined;
  getConnecting(): boolean;
}

export function createTopBarLogic(
  {worker, nicknameStateHandle, chatStateHandle}: {
    worker: WorkerStateHandle;
    nicknameStateHandle: NicknameStateHandle;
    chatStateHandle: ChatStateHandle;
  }
): TopBarLogic {
  const chatList = createChatListTopBarLogic({nicknameStateHandle});

  const events: Observable<TopBarEvent> = createObservable();
  let chat: ChatTopBarLogic | undefined;

  function setChat(value?: ChatTopBarLogic) {
    chat = value;
    events.emit({ type: "chat", value: chat });
  }

  worker.events.subscribe(event => {
    switch (event.type) {
      case "connected":
        events.emit({ type: "connecting", value: !event.value });
        break;
    }
  });

  chatStateHandle.updates.subscribe(chat => {
    if (!chat) {
      setChat(undefined);
      return;
    }
    const {chatId, title} = chat;
    const value = createChatTopBarLogic({worker, chatId, title, chatStateHandle});
    setChat(value);
  })

  return {
    events,

    getChatList: () => chatList,
    getChat: () => chat,
    getConnecting: () => !worker.isConnected()
  }
}

import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {Message} from "@/modules/chat/logic/message.ts";
import {loadLocalMessages} from "@/modules/chat/logic/load-local-messages-usecase.ts";
import {Cancellation, createObservable, Observable} from "@/coroutines/observable.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {listenWorkerEvents} from "@/modules/chat/logic/listen-worker-events.ts";
import {sendMessage} from "@/modules/chat/logic/send-message.ts";
import {ChatTopBarLogic, createChatTopBarLogic} from "@/modules/chat/logic/top-bar/chat-top-bar-logic.ts";
import {NicknameStateHandle} from "@/modules/main/logic/nickname-state-handle.ts";
import {listenNickname} from "@/modules/chat/logic/listen-nickname.ts";

export type ChatEvent = {
  type: "nickname";
  value: string;
} | {
  type: "text";
  value: string;
} | {
  type: "updating";
  value: boolean;
} | {
  type: "messages";
  value: Message[];
};

export interface ChatLogic {
  topBar: ChatTopBarLogic;

  events: Observable<ChatEvent>;

  getUpdating(): boolean;

  getText(): string;
  setText(value: string): void;

  getMessages(): Message[];

  mount(): Cancellation;

  sendMessage(): void;
}

export async function createChatLogic(
  {
    persistence, worker, nickname, chatId
  }: {
    chatId: string;
    nickname: NicknameStateHandle;
    persistence: SeedPersistence;
    worker: WorkerStateHandle;
  },
): Promise<ChatLogic | undefined> {
  const chat = await persistence.chat.get(chatId);
  if (!chat) return;
  const title = chat.title;

  const topBar = createChatTopBarLogic({worker, chatId, title});

  const events: Observable<ChatEvent> = createObservable();

  let messages: Message[] = [];
  let localNonce = 0;
  let serverNonce = 0;
  let loading = !worker.isConnected();
  let updating = !worker.isWaiting(chatId);
  let text = "";

  function setMessages(value: Message[]) {
    messages = value;
    events.emit({ type: "messages", value: messages });
  }

  function setUpdating(value: boolean) {
    updating = value;
    events.emit({ type: "updating", value: loading });
  }

  function setText(value: string) {
    text = value;
    events.emit({ type: "text", value: text });
  }

  function editMessage(modified: Message) {
    setMessages(
      messages.map(message => message.localNonce == modified.localNonce
        ? modified
        : message
      )
    )
  }

  listenNickname({
    nickname,
    getMessages: () => messages, setMessages,
    setDisplayNickname: (value) => events.emit({ type: "nickname", value })
  });

  loadLocalMessages({
    chatId, nickname,
    serverNonce, setServerNonce: (value) => serverNonce = value,
    localNonce, setLocalNonce: (value) => localNonce = value,
    setMessages, persistence
  });

  return {
    topBar,
    events,
    getUpdating: () => updating,
    getMessages: () => messages,
    getText: () => text, setText,
    mount(): Cancellation {
      return listenWorkerEvents({
        worker, chatId, nickname,
        getMessages: () => messages, setMessages,
        setUpdating,
        getLocalNonce: () => localNonce, setLocalNonce: (value) => localNonce = value,
        getServerNonce: () => serverNonce, setServerNonce: (value) => serverNonce = value,
      });
    },
    sendMessage() {
      sendMessage({
        chatId,
        nickname: nickname.get(),
        text, setText,
        getLocalNonce: () => localNonce,
        setLocalNonce: (value) => localNonce = value,
        getServerNonce: () => serverNonce,
        setServerNonce: (value) => serverNonce = value,
        getMessages: () => messages, setMessages,
        editMessage, worker
      });
    }
  }
}

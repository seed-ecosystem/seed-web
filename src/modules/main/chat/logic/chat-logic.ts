import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {Message} from "@/modules/main/chat/logic/message.ts";
import {loadLocalMessages} from "@/modules/main/chat/logic/load-local-messages-usecase.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {listenWorkerEvents} from "@/modules/main/chat/logic/listen-worker-events.ts";
import {sendMessage} from "@/modules/main/chat/logic/send-message.ts";
import {NicknameStateHandle} from "@/modules/main/logic/nickname-state-handle.ts";
import {listenNickname} from "@/modules/main/chat/logic/listen-nickname.ts";
import {Cancellation} from "@/coroutines/cancellation.ts";

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
  events: Observable<ChatEvent>;

  getUpdating(): boolean;

  getText(): string;
  setText(value: string): void;

  getMessages(): Message[];

  mount(): Cancellation;

  sendMessage(): void;
}

export function createChatLogic(
  {
    persistence, worker, nicknameStateHandle, chatId
  }: {
    chatId: string;
    nicknameStateHandle: NicknameStateHandle;
    persistence: SeedPersistence;
    worker: WorkerStateHandle;
  },
): ChatLogic {
  const events: Observable<ChatEvent> = createObservable();

  let messages: Message[] = [];
  let localNonce = 0;
  let serverNonce = 0;
  let updating = !worker.isWaiting(chatId);
  let text = "";

  function setMessages(value: Message[]) {
    messages = value;
    events.emit({ type: "messages", value: messages });
  }

  function setUpdating(value: boolean) {
    updating = value;
    events.emit({ type: "updating", value: updating });
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
    nickname: nicknameStateHandle,
    getMessages: () => messages, setMessages,
    setDisplayNickname: (value) => events.emit({ type: "nickname", value })
  });

  loadLocalMessages({
    chatId, nickname: nicknameStateHandle,
    serverNonce, setServerNonce: (value) => serverNonce = value,
    localNonce, setLocalNonce: (value) => localNonce = value,
    setMessages, persistence
  });

  return {
    events,
    getUpdating: () => updating,
    getMessages: () => messages,
    getText: () => text, setText,
    mount(): Cancellation {
      return listenWorkerEvents({
        worker, chatId, nickname: nicknameStateHandle,
        getMessages: () => messages, setMessages,
        setUpdating,
        getLocalNonce: () => localNonce, setLocalNonce: (value) => localNonce = value,
        getServerNonce: () => serverNonce, setServerNonce: (value) => serverNonce = value,
      });
    },
    sendMessage() {
      sendMessage({
        chatId,
        nickname: nicknameStateHandle.get(),
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

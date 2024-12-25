import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {Channel} from "@/modules/coroutines/channel/channel.ts";
import {createChannel} from "@/modules/coroutines/channel/create.ts";
import {Message} from "@/modules/chat/logic/message.ts";
import {loadLocalMessages} from "@/modules/chat/logic/load-local-messages-usecase.ts";
import {loadNickname} from "@/modules/chat/logic/load-nickname.ts";
import {onNicknameChange} from "@/modules/chat/logic/on-nickname-change.ts";
import {Cancellation} from "@/coroutines/observable.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {listenWorkerEvents} from "@/modules/chat/logic/listen-worker-events.ts";
import {sendMessage} from "@/modules/chat/logic/send-message.ts";

export type ChatEvent = {
  type: "nickname";
  value: string;
} | {
  type: "text";
  value: string;
} | {
  type: "loading";
  value: boolean;
} | {
  type: "updating";
  value: boolean;
} | {
  type: "messages";
  value: Message[];
};

export interface ChatLogic {
  events: Channel<ChatEvent>

  getLoading(): boolean;
  getUpdating(): boolean;

  getNickname(): string;
  setNickname(value: string): void;

  getText(): string;
  setText(value: string): void;

  getMessages(): Message[];

  mount(): Cancellation;

  sendMessage(): void;
}

export function createChatLogic(
  {
    persistence, worker, chatId,
  }: {
    chatId: string;
    persistence: SeedPersistence;
    worker: WorkerStateHandle;
  },
): ChatLogic {
  const events: Channel<ChatEvent> = createChannel();

  let messages: Message[] = [];
  let localNonce = 0;
  let serverNonce = 0;
  let loading = !worker.isConnected();
  let updating = !worker.isWaiting(chatId);
  let nickname = "";
  let text = "";

  function setMessages(value: Message[]) {
    messages = value;
    events.send({ type: "messages", value: messages });
  }

  function setLoading(value: boolean) {
    loading = value;
    events.send({ type: "loading", value: loading });
  }

  function setUpdating(value: boolean) {
    updating = value;
    events.send({ type: "updating", value: loading });
  }

  function setNickname(value?: string) {
    onNicknameChange({
      value,
      setNickname: (value) => nickname = value,
      setDisplayNickname: (value) => events.send({ type: "nickname", value: value }),
      getMessages: () => messages, setMessages,
      persistence
    });
  }

  function setText(value: string) {
    text = value;
    events.send({ type: "text", value: text });
  }

  function editMessage(modified: Message) {
    setMessages(
      messages.map(message => message.localNonce == modified.localNonce
        ? modified
        : message
      )
    )
  }

  loadNickname({persistence, setNickname});

  loadLocalMessages({
    chatId,
    getNickname: () => nickname,
    serverNonce, setServerNonce: (value) => serverNonce = value,
    localNonce, setLocalNonce: (value) => localNonce = value,
    setMessages, persistence
  });

  return {
    events,
    getLoading: () => loading,
    getUpdating: () => updating,
    getMessages: () => messages,
    getNickname: () => nickname, setNickname,
    getText: () => text, setText,
    mount(): Cancellation {
      return listenWorkerEvents({
        worker, chatId,
        getNickname: () => nickname,
        getMessages: () => messages, setMessages,
        setLoading, setUpdating,
        getLocalNonce: () => localNonce, setLocalNonce: (value) => localNonce = value,
        getServerNonce: () => serverNonce, setServerNonce: (value) => serverNonce = value,
      });
    },
    sendMessage() {
      sendMessage({
        chatId, text, setText, nickname,
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

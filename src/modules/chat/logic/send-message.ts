import {Message, MessageContent} from "@/modules/chat/logic/message.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {sanitizeContent} from "@/modules/umbrella/logic/sanitize-messages.ts";

export type SendMessageOptions = {
  chatId: string;
  text: string;
  setText(value: string): void;
  nickname: string;
  getLocalNonce(): number;
  setLocalNonce(value: number): void;
  getServerNonce(): number;
  setServerNonce(value: number): void;
  getMessages(): Message[];
  setMessages(messages: Message[]): void;
  editMessage(message: Message): void;
  worker: WorkerStateHandle;
}

export function sendMessage(
  {
    chatId, text, setText, nickname,
    getLocalNonce, setLocalNonce,
    getServerNonce, setServerNonce,
    getMessages, setMessages,
    editMessage, worker
  }: SendMessageOptions
) {
  setText("");

  const content: MessageContent = {
    author: true,
    ...sanitizeContent({
      type: "regular",
      text: text,
      title: nickname,
    })
  };

  const localNonce = getLocalNonce() + 1;
  setLocalNonce(localNonce);

  const message: Message = {
    content,
    failure: false,
    loading: true,
    localNonce: localNonce,
    serverNonce: null
  };

  setMessages([message, ...getMessages()]);

  worker.sendMessage({ chatId, content }).then(serverNonce => {
    if (serverNonce) {
      editMessage({
        ...message,
        serverNonce: serverNonce,
        failure: false,
        loading: false,
      });
      if (serverNonce > getServerNonce()) {
        setServerNonce(serverNonce);
      }
    } else {
      editMessage({
        ...message,
        failure: true,
        loading: false,
      });
    }
  });
}

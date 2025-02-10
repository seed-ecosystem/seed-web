import { Message, MessageContent } from "@/modules/main/chat/logic/message.ts";
import { WorkerStateHandle } from "@/modules/umbrella/logic/worker-state-handle.ts";
import { sanitizeContent } from "@/modules/umbrella/logic/sanitize-messages.ts";
import { ChatListStateHandle } from "@/modules/main/chat-list/logic/chat-list-state-handle.ts";

export type SendMessageOptions = {
  url: string;
  queueId: string;
  nickname: string;
  text: string;
  setText: (value: string) => void;
  getLocalNonce: () => number;
  setLocalNonce: (value: number) => void;
  getServerNonce: () => number;
  setServerNonce: (value: number) => void;
  getMessages: () => Message[];
  setMessages: (messages: Message[]) => void;
  editMessage: (message: Message) => void;
  worker: WorkerStateHandle;
  chatListStateHandle: ChatListStateHandle;
}

export function sendMessage(
  {
    url, queueId, text, setText, nickname,
    getLocalNonce, setLocalNonce,
    getServerNonce, setServerNonce,
    getMessages, setMessages,
    editMessage, worker, chatListStateHandle,
  }: SendMessageOptions,
) {
  setText("");
  if (text.trim().length == 0) return;

  const content: MessageContent = {
    author: true,
    ...sanitizeContent({
      type: "regular",
      text: text,
      title: nickname,
    }),
  };

  const localNonce = getLocalNonce() + 1;
  setLocalNonce(localNonce);

  const message: Message = {
    content,
    failure: false,
    loading: !worker.getConnected(), // Loading after 300ms
    localNonce: localNonce,
    serverNonce: null,
  };

  setMessages([message, ...getMessages()]);

  chatListStateHandle.popUp(queueId, content, 0);

  let messageSent: boolean;

  setTimeout(() => {
    if (messageSent) return;
    editMessage({ ...message, loading: true });
  }, 300);

  void worker.send(url, { queueId: queueId, content }).then(serverNonce => {
    messageSent = true;
    if (serverNonce != null) {
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

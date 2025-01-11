import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {Message} from "@/modules/main/chat/logic/message.ts";
import {NicknameStateHandle} from "@/modules/main/logic/nickname-state-handle.ts";
import {Cancellation} from "@/coroutines/cancellation.ts";

export type ListenWorkerEventsOptions = {
  worker: WorkerStateHandle;
  chatId: string;
  nickname: NicknameStateHandle;
  getMessages(): Message[];
  setMessages(value: Message[]): void;
  setUpdating(value: boolean): void;
  getLocalNonce(): number;
  setLocalNonce(value: number): void;
  getServerNonce(): number;
  setServerNonce(value: number): void;
}

export function listenWorkerEvents(
  {
    worker, chatId, nickname,
    getMessages, setMessages,
    setUpdating,
    getLocalNonce, setLocalNonce,
    getServerNonce, setServerNonce
  }: ListenWorkerEventsOptions
): Cancellation {
  return worker.events.subscribe(event => {
    switch (event.type) {
      case "new":
        if (event.chatId != chatId) return;

        const messages: Message[] = [];

        for (let eventMessage of event.messages) {
          if (getServerNonce() >= eventMessage.nonce) {
            continue
          }
          setServerNonce(eventMessage.nonce);

          let content;

          content = eventMessage.content;

          if (content.type == "regular") {
            content = {
              ...content,
              author: nickname.get() == content.title
            };
          }

          const nonce = getLocalNonce() + 1;
          setLocalNonce(nonce);

          const message: Message = {
            content,
            failure: false,
            loading: false,
            localNonce: nonce,
            serverNonce: eventMessage.nonce
          };

          messages.unshift(message);
        }

        setMessages([...messages, ...getMessages()]);
        break;
      case "waiting":
        if (event.chatId != chatId) break;
        setUpdating(!event.value)
        break;
    }
  });
}

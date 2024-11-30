import {Chat} from "@/persistence/chat/chat.ts";
import {EventBus} from "@/usecase/chat/event-bus/event-bus.ts";
import {MessageStorage} from "@/persistence/message/message-storage.ts";
import {launch} from "@/coroutines/launch.ts";
import {GetNicknameUsecase} from "@/usecase/chat/nickname/get-nickname-usecase.ts";

export interface MessagesHistoryUsecase {
  (): void;
}

export function messagesHistoryUsecase(
  {chat, events, messagesStorage, getNickname}: {
    chat: Chat;
    events: EventBus;
    messagesStorage: MessageStorage,
    getNickname: GetNicknameUsecase,
  }
): MessagesHistoryUsecase {
  return () => launch(async () => {
    const messages = await messagesStorage.list(chat);

    const nickname = getNickname();

    for (const message of messages) {
      if (message.content.type == "deferred") continue;

      const content = message.content;

      events.emit({
        type: "history",
        message: {
          ...message,
          content,
          isAuthor: message.content.type == "regular" && message.content.title == nickname,
          isSending: false,
          isFailure: false,
          nonce: {
            server: message.nonce
          }
        },
      })
    }
  });
}

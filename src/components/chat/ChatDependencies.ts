import {createChatEventBus} from "@/usecase/chat/event-bus/create-chat-event-bus.ts";
import {createGetHistoryUsecase} from "@/usecase/chat/get-history-usecase/create-get-history-usecase.ts";
import {createLoadMoreUsecase} from "@/usecase/chat/load-more-usecase/create-load-more-usecase.ts";
import {AppDependencies} from "@/components/AppDependencies.ts";
import {createMessageCoder} from "@/crypto/create-message-coder.ts";
import {createGetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/create-get-message-key-usecase.ts";
import {Chat} from "@/persistence/chat/chat.ts";
import {EventBus} from "@/usecase/chat/event-bus/event-bus.ts";
import {LoadMoreUsecase} from "@/usecase/chat/load-more-usecase/load-more-usecase.ts";

export interface ChatDependencies {
  events: EventBus;
  loadMore: LoadMoreUsecase;
}

export function createChatDependencies(
  app: AppDependencies,
  chat: Chat
): ChatDependencies {
  const {socket, persistence} = app;

  const {key} = persistence;

  const events = createChatEventBus();
  const coder = createMessageCoder();

  const getMessageKey = createGetMessageKeyUsecase({ keyStorage: key, coder, chat });
  const getHistory = createGetHistoryUsecase({ socket, coder, chat, getMessageKey });
  const loadMore = createLoadMoreUsecase({ getHistory, events });

  return {
    events, loadMore
  };
}

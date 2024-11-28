import {createChatEventBus} from "@/usecase/chat/event-bus/create-chat-event-bus.ts";
import {createGetHistoryUsecase} from "@/usecase/chat/get-history-usecase/create-get-history-usecase.ts";
import {createLoadMoreUsecase} from "@/usecase/chat/load-more-usecase/create-load-more-usecase.ts";
import {AppDependencies} from "@/components/AppDependencies.ts";
import {createMessageCoder} from "@/crypto/create-message-coder.ts";
import {createGetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/create-get-message-key-usecase.ts";
import {Chat} from "@/persistence/chat/chat.ts";
import {EventBus} from "@/usecase/chat/event-bus/event-bus.ts";
import {LoadMoreUsecase} from "@/usecase/chat/load-more-usecase/load-more-usecase.ts";
import {SendMessageUsecase} from "@/usecase/chat/send-message/send-message-usecase.ts";
import {createSendMessageUsecase} from "@/usecase/chat/send-message/create-send-message-usecase.ts";
import {createLocalNonceUsecase} from "@/usecase/chat/nonce/create-local-nonce-usecase.ts";
import {SetNicknameUsecase} from "@/usecase/chat/nickname/set-nickname-usecase.ts";
import {createSetNicknameUsecase} from "@/usecase/chat/nickname/create-set-nickname-usecase.ts";
import {GetNicknameUsecase} from "@/usecase/chat/nickname/get-nickname-usecase.ts";
import {createGetNicknameUsecase} from "@/usecase/chat/nickname/create-get-nickname-usecase.ts";
import {createSanitizeContentUsecase} from "@/usecase/chat/sanitize-content-usecase/create-sanitize-content-usecase.ts";

export interface ChatDependencies {
  chat: Chat;
  events: EventBus;
  loadMore: LoadMoreUsecase;
  sendMessage: SendMessageUsecase;
  setNickname: SetNicknameUsecase;
  getNickname: GetNicknameUsecase;
}

export function createChatDependencies(
  app: AppDependencies,
  chat: Chat
): ChatDependencies {
  const {socket, persistence} = app;

  const {key} = persistence;

  const events = createChatEventBus();
  const coder = createMessageCoder();
  const sanitizeContent = createSanitizeContentUsecase();

  const getMessageKey = createGetMessageKeyUsecase({ keyStorage: key, coder, chat });
  const getHistory = createGetHistoryUsecase({ socket, coder, chat, getMessageKey, sanitizeContent });
  const loadMore = createLoadMoreUsecase({ getHistory, events });

  const localNonce = createLocalNonceUsecase();

  const nickname = createGetNicknameUsecase({
    events, storage: persistence.nickname
  })

  const sendMessage = createSendMessageUsecase({
    coder, events, localNonce,
    getMessageKey, socket,
    nickname, sanitizeContent
  });

  const setNickname = createSetNicknameUsecase({
    events,
    storage: persistence.nickname
  });

  const getNickname = createGetNicknameUsecase({
    events,
    storage: persistence.nickname
  });

  return {
    events, loadMore, sendMessage,
    chat, setNickname, getNickname
  };
}

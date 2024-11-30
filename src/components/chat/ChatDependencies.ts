import {createChatEventBus} from "@/usecase/chat/event-bus/create-chat-event-bus.ts";
import {AppDependencies} from "@/components/AppDependencies.ts";
import {createMessageCoder} from "@/crypto/create-message-coder.ts";
import {createGetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/create-get-message-key-usecase.ts";
import {Chat} from "@/persistence/chat/chat.ts";
import {EventBus} from "@/usecase/chat/event-bus/event-bus.ts";
import {
  createSendTextMessageUsecase,
  SendTextMessageUsecase
} from "@/usecase/chat/send-message/send-text-message-usecase.ts";
import {createLocalNonceUsecase} from "@/usecase/chat/nonce/create-local-nonce-usecase.ts";
import {SetNicknameUsecase} from "@/usecase/chat/nickname/set-nickname-usecase.ts";
import {createSetNicknameUsecase} from "@/usecase/chat/nickname/create-set-nickname-usecase.ts";
import {GetNicknameUsecase} from "@/usecase/chat/nickname/get-nickname-usecase.ts";
import {createGetNicknameUsecase} from "@/usecase/chat/nickname/create-get-nickname-usecase.ts";
import {createSanitizeContentUsecase} from "@/usecase/chat/sanitize-content-usecase/create-sanitize-content-usecase.ts";
import {
  createMessagesSnapshotUsecase
} from "@/usecase/chat/messages-snapshot-usecase/create-messages-snapshot-usecase.ts";
import {createDecodeMessagesUsecase} from "@/usecase/chat/decode-messages-usecase/decode-message-usecase.ts";
import {handleSocketEventsUsecase} from "@/usecase/chat/socket-event-usecase/handle-socket-events-usecase.ts";
import {createSendMessageUsecase} from "@/usecase/chat/send-message/send-message-usecase.ts";
import {messagesHistoryUsecase} from "@/usecase/chat/messages-history-usecase/messages-history-usecase.ts";
import {OptionPredicator} from "typia/lib/programmers/helpers/OptionPredicator";

export interface ChatDependencies {
  chat: Chat;
  events: EventBus;
  sendMessage: SendTextMessageUsecase;
  setNickname: SetNicknameUsecase;
  getNickname: GetNicknameUsecase;
}

export function createChatDependencies(
  app: AppDependencies,
  chat: Chat
): ChatDependencies {
  const {socket, persistence} = app;

  const events = createChatEventBus();
  const coder = createMessageCoder();
  const sanitizeContent = createSanitizeContentUsecase();
  const messagesSnapshot = createMessagesSnapshotUsecase({events});

  const nickname = createGetNicknameUsecase({
    events, messagesSnapshot, storage: persistence.nickname
  })

  const getNickname = createGetNicknameUsecase({
    events,
    messagesSnapshot,
    storage: persistence.nickname
  });

  const getMessageKey = createGetMessageKeyUsecase({ messageStorage: persistence.message, coder, chat });

  const decodeMessage = createDecodeMessagesUsecase({
    getMessageKey, coder,
    sanitizeContent, getNickname
  });

  const localNonce = createLocalNonceUsecase();

  const sendMessage = createSendMessageUsecase({
    coder, events, localNonce,
    getMessageKey, socket,
    sanitizeContent, chat
  });

  const sendTextMessage = createSendTextMessageUsecase({
    nickname, sendMessage
  });

  const setNickname = createSetNicknameUsecase({
    events,
    storage: persistence.nickname
  });

  const socketEventUsecase = handleSocketEventsUsecase({
    decodeMessage, events,
    socket, messagesSnapshot,
    messagesStorage: persistence.message
  });
  socketEventUsecase();

  const messageHistoryUsecase = messagesHistoryUsecase({
    chat, events, getNickname, messagesStorage: persistence.message
  });
  messageHistoryUsecase();

  return {
    events, sendMessage: sendTextMessage,
    chat, setNickname, getNickname
  };
}

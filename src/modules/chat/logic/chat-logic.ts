import {ChangeNicknameUsecase, createChangeNicknameUsecase} from "@/modules/chat/logic/change-nickname-usecase.ts";
import {createSendMessageUsecase} from "@/modules/chat/logic/send-message-usecase.ts";
import {ChatEventsUsecase, createChatEventsUsecase} from "@/modules/chat/logic/chat-events-usecase.ts";
import {Persistence} from "@/modules/umbrella/persistence/persistence.ts";
import {createDecodeMessageUsecase} from "@/modules/chat/logic/decode-message-usecase.ts";
import {SeedSocket} from "@/modules/socket/seed-socket.ts";
import {MessageCoder} from "@/modules/crypto/message-coder.ts";
import {IncrementLocalNonceUsecase} from "@/modules/chat/logic/increment-local-nonce-usecase.ts";
import {createGetNicknameUsecase, GetNicknameUsecase} from "@/modules/chat/logic/get-nickname-usecase.ts";
import {
  createLoadLocalMessagesUsecase,
  LoadLocalMessagesUsecase
} from "@/modules/chat/logic/load-local-messages-usecase.ts";
import {createNextMessageUsecase} from "@/modules/chat/logic/next-message-usecase.ts";
import {createSanitizeContentUsecase} from "@/modules/chat/logic/sanitize-content-usecase.ts";
import {createSendTextMessageUsecase, SendTextMessageUsecase} from "@/modules/chat/logic/send-text-message-usecase.ts";
import {createGetWaitingUsecase, GetWaitingUsecase} from "@/modules/chat/logic/get-waiting-usecase.ts";
import {SeedClient} from "@/modules/client/seed-client.ts";
import {createGetLoadingUsecase, GetLoadingUsecase} from "@/modules/chat/logic/get-loading-usecase.ts";

export interface ChatLogic {
  changeNickname: ChangeNicknameUsecase;
  getNickname: GetNicknameUsecase;
  getWaiting: GetWaitingUsecase;
  getLoading: GetLoadingUsecase;
  sendTextMessage: SendTextMessageUsecase;
  chatEvents: ChatEventsUsecase;
  loadLocalMessages: LoadLocalMessagesUsecase;
}

export function createChatLogic(
  {
    persistence, socket, client,
    messageCoder, chatId, incrementLocalNonce,
  }: {
    persistence: Persistence;
    client: SeedClient;
    socket: SeedSocket;
    messageCoder: MessageCoder;
    chatId: string;
    incrementLocalNonce: IncrementLocalNonceUsecase;
  },
): ChatLogic {
  const {message: messageStorage, nickname: nicknameStorage} = persistence;

  const nextMessage = createNextMessageUsecase({messageStorage, messageCoder, chatId});
  const sanitizeContent = createSanitizeContentUsecase();

  const decodeMessage = createDecodeMessageUsecase({
    messageStorage, messageCoder,
    chatId, incrementLocalNonce,
    nextMessage, sanitizeContent
  });

  const sendMessage = createSendMessageUsecase({
    socket, messageCoder, incrementLocalNonce,
    nextMessage, sanitizeContent, chatId
  });

  return {
    changeNickname: createChangeNicknameUsecase({nicknameStorage}),
    chatEvents: createChatEventsUsecase({decodeMessage, socket, chatId}),
    getNickname: createGetNicknameUsecase({nicknameStorage}),
    getWaiting: createGetWaitingUsecase({client, chatId}),
    getLoading: createGetLoadingUsecase({client}),
    loadLocalMessages: createLoadLocalMessagesUsecase({messageStorage, chatId, incrementLocalNonce}),
    sendTextMessage: createSendTextMessageUsecase({sendMessage}),
  }
}

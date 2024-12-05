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

export interface ChatLogic {
  changeNickname: ChangeNicknameUsecase;
  getNickname: GetNicknameUsecase;
  sendTextMessage: SendTextMessageUsecase;
  chatEvents: ChatEventsUsecase;
  loadLocalMessages: LoadLocalMessagesUsecase;
}

export function createChatLogic(
  {
    nickname: nicknameStorage,
    message: messageStorage,
    socket, messageCoder, chatId, incrementLocalNonce,
  }: Persistence & {
    socket: SeedSocket;
    messageCoder: MessageCoder;
    chatId: string;
    incrementLocalNonce: IncrementLocalNonceUsecase;
  },
): ChatLogic {
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
    chatEvents: createChatEventsUsecase({decodeMessage, socket}),
    getNickname: createGetNicknameUsecase({nicknameStorage}),
    loadLocalMessages: createLoadLocalMessagesUsecase({messageStorage, chatId, incrementLocalNonce}),
    sendTextMessage: createSendTextMessageUsecase({sendMessage}),
  }
}

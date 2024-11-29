
import {describe, expect, it} from "vitest";
import {createPersistence} from "@/persistence/create-persistence.ts";
import {randomAESKey} from "@/crypto/subtle-crypto.ts";
import {createSendMessageUsecase} from "@/usecase/chat/send-message/create-send-message-usecase.ts";
import {createServerSocket} from "@/api/create-server-socket.ts";
import {createMessageCoder} from "@/crypto/create-message-coder.ts";
import {createChatEventBus} from "@/usecase/chat/event-bus/create-chat-event-bus.ts";
import {createLocalNonceUsecase} from "@/usecase/chat/nonce/create-local-nonce-usecase.ts";
import {createGetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/create-get-message-key-usecase.ts";
import {createGetNicknameUsecase} from "@/usecase/chat/nickname/create-get-nickname-usecase.ts";
import {createSanitizeContentUsecase} from "@/usecase/chat/sanitize-content-usecase/create-sanitize-content-usecase.ts";
import {
  createMessagesSnapshotUsecase
} from "@/usecase/chat/messages-snapshot-usecase/create-messages-snapshot-usecase.ts";

describe('send message checks', () => {
  it('check usecase', async () => {

    const socket = createServerSocket("https://meetacy.app/seed-go");

    const persistence = await createPersistence();
    const chatId = await randomAESKey();
    const events = createChatEventBus();

    const coder = createMessageCoder();

    const messageKey = createGetMessageKeyUsecase({
      keyStorage: persistence.key,
      coder: coder,
      chat: { chatId: chatId },
    });

    const sanitizeContent = createSanitizeContentUsecase();
    const messagesSnapshot = createMessagesSnapshotUsecase({events});

    const usecase = createSendMessageUsecase({
      socket: socket,
      coder: coder,
      getMessageKey: messageKey,
      events: events,
      localNonce: createLocalNonceUsecase(),
      nickname: createGetNicknameUsecase({
        events, storage:
        persistence.nickname,
        messagesSnapshot
      }),
      sanitizeContent,
    });

    events.flow.collect((event) => {
      console.log(event);
    });

    usecase({
      text: "Text!",
      chatId: chatId
    });


  });
});


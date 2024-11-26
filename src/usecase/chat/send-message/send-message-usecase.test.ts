
import {describe, expect, it} from "vitest";
import {createPersistence} from "@/persistence/create-persistence.ts";
import {randomAESKey} from "@/crypto/subtle-crypto.ts";
import {createSendMessageUsecase} from "@/usecase/chat/send-message/create-send-message-usecase.ts";
import {createServerSocket} from "@/api/create-server-socket.ts";
import {createMessageCoder} from "@/crypto/create-message-coder.ts";
import {createChatEventsUsecase} from "@/usecase/chat/events-usecase/create-chat-events-usecase.ts";
import {createLocalNonceUsecase} from "@/usecase/chat/nonce/create-local-nonce-usecase.ts";
import {createGetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/create-get-message-key-usecase.ts";

describe('send message checks', () => {
  it('check usecase', async () => {

    const socket = createServerSocket("https://meetacy.app/seed-go");
    await socket.open();

    const persistence = await createPersistence();
    const chatId = await randomAESKey();
    const events = createChatEventsUsecase();

    const coder = createMessageCoder();

    const messageKey = createGetMessageKeyUsecase({
      keyStorage: persistence.key,
      coder: coder,
      chat: { chatId: chatId },
    });

    const usecase = createSendMessageUsecase({
      socket: socket,
      coder: coder,
      messageKey: messageKey,
      messageStorage: persistence.message,
      events: events,
      localNonce: createLocalNonceUsecase()
    });

    events.flow.collect((event) => {
      console.log(event);
    });

    await usecase({
      title: "Alex Sokol!",
      text: "Text!",
      chatId: chatId
    });
  });
});


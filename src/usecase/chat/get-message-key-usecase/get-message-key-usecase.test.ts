
import {describe, expect, it} from "vitest";
import {createPersistence} from "@/persistence/create-persistence.ts";
import {randomAESKey} from "@/crypto/subtle-crypto.ts";
import {createSendMessageUsecase} from "@/usecase/chat/send-message/create-send-message-usecase.ts";
import {createServerSocket} from "@/api/create-server-socket.ts";
import {createMessageCoder} from "@/crypto/create-message-coder.ts";
import {createChatEventBus} from "@/usecase/chat/event-bus/create-chat-event-bus.ts";
import {createLocalNonceUsecase} from "@/usecase/chat/nonce/create-local-nonce-usecase.ts";
import {createGetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/create-get-message-key-usecase.ts";

describe('get message key checks', () => {
  it('check usecase', async () => {
    const persistence = await createPersistence();

    const chat = { chatId: await randomAESKey() };
    const coder = createMessageCoder();
    const initial = await randomAESKey();

    await persistence.key.push({
      chat: chat,
      key: initial,
      nonce: 0
    });

    const usecase = createGetMessageKeyUsecase({
      keyStorage: persistence.key,
      coder: coder,
      chat: chat
    });

    expect(await usecase(0)).toStrictEqual(initial);

    console.log(await usecase(1_000));
  });
});

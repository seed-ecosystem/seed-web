
import {describe, expect, it} from "vitest";
import {createPersistence} from "@/persistence/create-persistence.ts";
import {randomAESKey} from "@/crypto/subtle-crypto.ts";
import {createSendMessageUsecase} from "@/usecase/send-message/create-send-message-usecase.ts";
import {createServerSocket} from "@/api/create-server-socket.ts";
import {createMessageCoder} from "@/crypto/create-message-coder.ts";

describe('send message checks', () => {
  it('check usecase', async () => {
    const persistence = await createPersistence();
    const chatId = await randomAESKey();

    const usecase = createSendMessageUsecase({
      socket: createServerSocket("http://localhost:8080"),
      coder: createMessageCoder(),
      storage: persistence.message,
    })

    await usecase({
      title: "Alex Sokol!",
      text: "Text!",
      chatId: chatId
    });
  });
});


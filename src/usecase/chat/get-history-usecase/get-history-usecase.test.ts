import {describe, expect, it} from "vitest";
import {createPersistence} from "@/persistence/create-persistence.ts";
import {randomAESKey} from "@/crypto/subtle-crypto.ts";
import {createServerSocket} from "@/api/create-server-socket.ts";
import {createMessageCoder} from "@/crypto/create-message-coder.ts";
import {createChatEventsUsecase} from "@/usecase/chat/events-usecase/create-chat-events-usecase.ts";
import {createGetHistoryUsecase} from "@/usecase/chat/get-history-usecase/create-get-history-usecase.ts";

describe('get messages checks', () => {
  it('check usecase', async () => {
    const socket = createServerSocket("https://meetacy.app/seed-go");
    await socket.open();

    const persistence = await createPersistence();
    const chatId = "9ZlK8PXm/l3EZ2/eW/chFz7J56uJHG4EL6ljbkKsVTQ=";
    const events = createChatEventsUsecase();

    console.log("test chat", chatId)

    const history = createGetHistoryUsecase({
      socket: socket,
      messageCoder: createMessageCoder(),
      messageStorage: persistence.message,
      chatStorage: persistence.chat,
      chat: { chatId: chatId }
    });

    events.flow.collect((event) => {
      console.log(event);
    });

    await history({
      fromNonce: undefined,
      amount: 5
    });
  });
});

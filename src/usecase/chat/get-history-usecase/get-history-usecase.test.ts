import {describe, expect, it} from "vitest";
import {createPersistence} from "@/persistence/create-persistence.ts";
import {randomAESKey} from "@/crypto/subtle-crypto.ts";
import {createServerSocket} from "@/api/create-server-socket.ts";
import {createMessageCoder} from "@/crypto/create-message-coder.ts";
import {createChatEventsUsecase} from "@/usecase/chat/events-usecase/create-chat-events-usecase.ts";
import {createGetHistoryUsecase} from "@/usecase/chat/get-history-usecase/create-get-history-usecase.ts";
import {createGetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/create-get-message-key-usecase.ts";
import {createSendMessageUsecase} from "@/usecase/chat/send-message/create-send-message-usecase.ts";
import {createLocalNonceUsecase} from "@/usecase/chat/nonce/create-local-nonce-usecase.ts";

describe('get messages checks', () => {
  it('check usecase', async () => {
    const chat = { chatId: "bHKhl2cuQ01pDXSRaqq/OMJeDFJVNIY5YuQB2w7ve+c=" };
    const key = "/uwFt2yxHi59l26H9V8VTN3Kq+FtRewuWNfz1TNVcnM=";

    console.log("Test Chat: ", chat, '\n');

    const socket = createServerSocket("https://meetacy.app/seed-go");
    await socket.open();

    const persistence = await createPersistence();
    const events = createChatEventsUsecase();
    const messageCoder = createMessageCoder();

    await persistence.key.push({
      chat: chat,
      nonce: 0,
      key: key
    });

    const getMessageKey = createGetMessageKeyUsecase({
      keyStorage: persistence.key,
      coder: messageCoder,
      chat: chat
    });

    const history = createGetHistoryUsecase({
      socket: socket,
      messageCoder: createMessageCoder(),
      chat: chat,
      getMessageKey: getMessageKey
    });

    const sendMessage = createSendMessageUsecase({
      socket: socket,
      messageKey: getMessageKey,
      messageStorage: persistence.message,
      events: events,
      localNonce: createLocalNonceUsecase(),
      coder: messageCoder
    })

    await sendMessage({
      ...chat,
      title: "Alex Sokol",
      text: "Hello world!"
    });

    events.flow.collect((event) => {
      console.log(event);
    });

    const result = await history({
      fromNonce: undefined,
      amount: 5
    });

    console.log("history", result, '\n');
  });
});

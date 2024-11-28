import {describe, expect, it} from "vitest";
import {createPersistence} from "@/persistence/create-persistence.ts";
import {createServerSocket} from "@/api/create-server-socket.ts";
import {createMessageCoder} from "@/crypto/create-message-coder.ts";
import {createChatEventBus} from "@/usecase/chat/event-bus/create-chat-event-bus.ts";
import {createGetHistoryUsecase} from "@/usecase/chat/get-history-usecase/create-get-history-usecase.ts";
import {createGetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/create-get-message-key-usecase.ts";
import {createSendMessageUsecase} from "@/usecase/chat/send-message/create-send-message-usecase.ts";
import {createLocalNonceUsecase} from "@/usecase/chat/nonce/create-local-nonce-usecase.ts";
import {createGetNicknameUsecase} from "@/usecase/chat/nickname/create-get-nickname-usecase.ts";
import {createSanitizeContentUsecase} from "@/usecase/chat/sanitize-content-usecase/create-sanitize-content-usecase.ts";
import {
  createMessagesSnapshotUsecase
} from "@/usecase/chat/messages-snapshot-usecase/create-messages-snapshot-usecase.ts";

describe('get messages checks', () => {
  it('check usecase', async () => {
    const chat = { chatId: "bHKhl2cuQ01pDXSRaqq/OMJeDFJVNIY5YuQB2w7ve+c=" };
    const key = "/uwFt2yxHi59l26H9V8VTN3Kq+FtRewuWNfz1TNVcnM=";

    console.log("Test Chat: ", chat, '\n');

    const socket = createServerSocket("https://meetacy.app/seed-go");
    await socket.open();

    const persistence = await createPersistence();
    const events = createChatEventBus();
    const messageCoder = createMessageCoder();
    const sanitizeContent = createSanitizeContentUsecase();
    const messagesSnapshot = createMessagesSnapshotUsecase({events});

    const nickname = createGetNicknameUsecase({events, messagesSnapshot, storage: persistence.nickname});

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
      coder: createMessageCoder(),
      chat: chat,
      getMessageKey: getMessageKey,
      sanitizeContent,
      getNickname: nickname
    });

    const sendMessage = createSendMessageUsecase({
      socket: socket,
      getMessageKey: getMessageKey,
      events: events,
      localNonce: createLocalNonceUsecase(),
      coder: messageCoder,
      nickname: createGetNicknameUsecase({
        events, messagesSnapshot, storage: persistence.nickname
      }),
      sanitizeContent
    })

    await sendMessage({
      ...chat,
      text: "Hello world!"
    });

    events.flow.collect((event) => {
      console.log(event);
    });

    const result = await history({
      nonce: null,
      amount: 5
    });

    console.log("history", result, '\n');
  });
});

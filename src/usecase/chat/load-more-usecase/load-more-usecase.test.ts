import {describe, expect, it} from "vitest";
import {createPersistence} from "@/persistence/create-persistence.ts";
import {randomAESKey} from "@/crypto/subtle-crypto.ts";
import {createMessageCoder} from "@/crypto/create-message-coder.ts";
import {createGetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/create-get-message-key-usecase.ts";
import {createServerSocket} from "@/api/create-server-socket.ts";
import {createChatEventBus} from "@/usecase/chat/event-bus/create-chat-event-bus.ts";
import {createGetHistoryUsecase} from "@/usecase/chat/get-history-usecase/create-get-history-usecase.ts";
import {createLoadMoreUsecase} from "@/usecase/chat/load-more-usecase/create-load-more-usecase.ts";

describe('load more checks', () => {
  it('check usecase', async () => {
    const chat = { chatId: "bHKhl2cuQ01pDXSRaqq/OMJeDFJVNIY5YuQB2w7ve+c=" };
    const key = "/uwFt2yxHi59l26H9V8VTN3Kq+FtRewuWNfz1TNVcnM=";

    console.log("Test Chat: ", chat, '\n');

    const socket = createServerSocket("https://meetacy.app/seed-go");
    await socket.open();

    console.log("Socket opened\n");

    const persistence = await createPersistence();
    const events = createChatEventBus();
    const messageCoder = createMessageCoder();

    events.flow.collect((event) => {
      console.log(event, '\n');
    });

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
      getMessageKey: getMessageKey
    });

    const loadMore = createLoadMoreUsecase({
      getHistory: history,
      events: events,
    });

    let hasMore = true;

    events.flow.collect((event) => {
      if (event.type == "has_no_more") {
        hasMore = false;
      }
    });

    while (hasMore) {
      loadMore();
      await new Promise(r => setTimeout(r, 500));
    }
  });
});

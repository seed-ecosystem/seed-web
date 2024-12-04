import {ChatLogic, createChatLogic} from "@/modules/chat/logic/chat-logic.ts";
import {createPersistence, Persistence} from "@/modules/umbrella/persistence/persistence.ts";
import {createServerSocket, SeedSocket} from "@/modules/socket/seed-socket.ts";
import {SubscribeRequest} from "@/modules/socket/request/subscribe-request.ts";
import {createMessageCoder} from "@/modules/crypto/message-coder.ts";
import {createIncrementLocalNonceUsecase} from "@/modules/chat/logic/increment-local-nonce-usecase.ts";
import {createNextMessageUsecase} from "@/modules/chat/logic/next-message-usecase.ts";

export interface Logic {
  socket: SeedSocket;
  persistence: Persistence;
  createChat(): ChatLogic
}

export async function createLogic(): Promise<Logic> {
  const chatId = "bHKhl2cuQ01pDXSRaqq/OMJeDFJVNIY5YuQB2w7ve+c=";
  const key = "/uwFt2yxHi59l26H9V8VTN3Kq+FtRewuWNfz1TNVcnM=";

  const messageCoder = createMessageCoder();
  const persistence = await createPersistence();
  const socket = createServerSocket("https://meetacy.app/seed-go");

  if (await persistence.message.lastMessage({chatId}) == null) {
    await persistence.message.add({
      chatId, key,
      nonce: 0,
      content: {
        type: "deferred"
      }
    });
  }

  const nextMessage = createNextMessageUsecase({messageStorage: persistence.message, messageCoder, chatId});

  // todo: remove bind and make init instead
  socket.bind({
    type: "subscribe",
    chatId,
    ...await nextMessage()
  } as SubscribeRequest);

  const incrementLocalNonce = createIncrementLocalNonceUsecase();

  // noinspection UnnecessaryLocalVariableJS
  const app: Logic = {
    socket: socket,
    persistence: persistence,
    createChat() {
      return createChatLogic({...persistence, socket, messageCoder, chatId, incrementLocalNonce});
    }
  };

  return app;
}

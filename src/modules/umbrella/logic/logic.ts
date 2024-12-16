import {createPersistence, Persistence} from "@/modules/umbrella/persistence/persistence.ts";
import {createServerSocket, SeedSocket} from "@/sdk/socket/seed-socket.ts";
import {createMessageCoder} from "@/modules/crypto/message-coder.ts";
import {createIncrementLocalNonceUsecase} from "@/modules/chat/logic/increment-local-nonce-usecase.ts";
import {createNextMessageUsecase} from "@/modules/chat/logic/next-message-usecase.ts";
import {createMainLogic, MainLogic} from "@/modules/main/logic/main-logic.ts";
import {createSeedClient} from "@/sdk/client/seed-client.ts";

export interface Logic {
  socket: SeedSocket;
  persistence: Persistence;

  createMainLogic(): MainLogic;
}

export async function createLogic(): Promise<Logic> {
  const messageCoder = createMessageCoder();
  const persistence = await createPersistence();
  const socket = createServerSocket("https://meetacy.app/seed-go");

  await addBetaChat({persistence});

  const client = createSeedClient({
    socket,
    chatStorage: persistence.chat,
    createNextMessage: (chatId) => createNextMessageUsecase({
      chatId, messageCoder, messageStorage: persistence.message
    })
  });

  const incrementLocalNonce = createIncrementLocalNonceUsecase();

  return {
    socket: socket,
    persistence: persistence,
    createMainLogic(): MainLogic {
      return createMainLogic({persistence, socket, messageCoder, incrementLocalNonce, client});
    }
  };
}

async function addBetaChat(
  {persistence}: {
    persistence: Persistence;
  }
) {
  const chatId = "bHKhl2cuQ01pDXSRaqq/OMJeDFJVNIY5YuQB2w7ve+c=";

  if ((await persistence.chat.list()).length == 0) {
    await persistence.chat.add({
      id: chatId,
      title: "Beta Chat"
    });

    await persistence.message.add({
      chatId,
      key: "/uwFt2yxHi59l26H9V8VTN3Kq+FtRewuWNfz1TNVcnM=",
      nonce: 0,
      content: {
        type: "deferred"
      }
    });
  }
}

import {SeedSocket} from "@/api/seed-socket.ts";
import {createServerSocket} from "@/api/create-server-socket.ts";
import {Persistence} from "@/persistence/persistence.ts";
import {createPersistence} from "@/persistence/create-persistence.ts";
import {ChatDependencies, createChatDependencies} from "@/components/chat/ChatDependencies.ts";
import {SubscribeRequest} from "@/api/request/subscribe-request.ts";

export interface AppDependencies {
  socket: SeedSocket;
  persistence: Persistence;

  createChat(): ChatDependencies;
}

export async function createAppDependencies(): Promise<AppDependencies> {
  const chat = { chatId: "bHKhl2cuQ01pDXSRaqq/OMJeDFJVNIY5YuQB2w7ve+c=" };
  const key = "/uwFt2yxHi59l26H9V8VTN3Kq+FtRewuWNfz1TNVcnM=";

  const persistence = await createPersistence();
  const socket = createServerSocket("https://meetacy.app/seed-go");

  const lastNonce = await persistence.message.lastMessageNonce(chat);

  // todo: remove bind and make init instead
  socket.bind({ type: "subscribe", chatId: chat.chatId, nonce: lastNonce ?? 0 } as SubscribeRequest);

  if (await persistence.message.lastMessage(chat) == null) {
    await persistence.message.add({
      ...chat,
      key: key,
      nonce: 0,
      content: {
        type: "deferred"
      }
    });
  }

  // noinspection UnnecessaryLocalVariableJS
  const app: AppDependencies = {
    socket: socket,
    persistence: persistence,
    createChat() {
      return createChatDependencies(this, chat);
    }
  };

  return app;
}

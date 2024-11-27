import {SeedSocket} from "@/api/seed-socket.ts";
import {createServerSocket} from "@/api/create-server-socket.ts";
import {Persistence} from "@/persistence/persistence.ts";
import {createPersistence} from "@/persistence/create-persistence.ts";
import {ChatDependencies, createChatDependencies} from "@/components/chat/ChatDependencies.ts";

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

  await socket.open();

  if (await persistence.key.last({ chat }) == null) {
    await persistence.key.push({
      chat: chat,
      key: key,
      nonce: 0
    });
  }

  // noinspection UnnecessaryLocalVariableJS
  const app: AppDependencies = {
    socket: socket,
    persistence: persistence,
    createChat() {
      const result = createChatDependencies(this, chat);
      result.loadMore();
      return result;
    }
  };

  return app;
}

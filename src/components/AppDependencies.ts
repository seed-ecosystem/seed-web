import {SeedSocket} from "@/api/seed-socket.ts";
import {createServerSocket} from "@/api/create-server-socket.ts";
import {Persistence} from "@/persistence/persistence.ts";
import {createPersistence} from "@/persistence/create-persistence.ts";
import {Chat} from "@/persistence/chat/chat.ts";

export interface AppDependencies {
  socket: SeedSocket;
  persistence: Persistence;
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

  return {
    socket: socket,
    persistence: persistence,
  };
}

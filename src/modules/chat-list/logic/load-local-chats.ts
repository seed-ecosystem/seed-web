import {Chat} from "@/modules/chat-list/logic/chat.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";

export type LoadLocalChatsOptions = {
  persistence: SeedPersistence;
};

export async function loadLocalChats({persistence}: LoadLocalChatsOptions): Promise<Chat[]> {
  const list: Chat[] = [];

  for (const chat of await persistence.chat.list()) {
    const lastMessage = await persistence.message.lastMessage({chatId: chat.id});

    const messageTitle = lastMessage?.content?.type == "regular" ? lastMessage?.content?.title : "Service";
    const messageText = lastMessage?.content?.type == "regular" ? lastMessage?.content?.text : "Service Message";

    list.push({
      id: chat.id,
      title: chat.title,
      lastMessage: {
        title: messageTitle,
        text: messageText,
      }
    });
  }

  return list;
}

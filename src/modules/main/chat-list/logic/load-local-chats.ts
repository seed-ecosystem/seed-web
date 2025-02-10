import { Chat } from "@/modules/main/chat-list/logic/chat.ts";
import { SeedPersistence } from "@/modules/umbrella/persistence/seed-persistence.ts";

export type LoadLocalChatsOptions = {
  persistence: SeedPersistence;
};

export async function loadLocalChats({ persistence }: LoadLocalChatsOptions): Promise<Chat[]> {
  const list: Chat[] = [];

  for (const chat of await persistence.chat.list()) {
    let lastMessage;

    lastMessage = await persistence.message.lastMessage({
      url: chat.serverUrl, queueId: chat.id,
    });

    lastMessage = lastMessage?.content.type == "regular" ? {
      title: lastMessage.content.title,
      text: lastMessage.content.text,
    } : undefined;

    list.push({
      id: chat.id,
      title: chat.title,
      unreadCount: chat.unreadCount,
      lastMessage,
    });
  }

  return list;
}

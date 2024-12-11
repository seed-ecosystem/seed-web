import {ChatStorage} from "@/modules/chat-list/persistence/chat-storage.ts";
import {Chat} from "@/modules/chat-list/logic/chat.ts";
import {Channel, launchChannel} from "@/modules/coroutines/channel.ts";
import {MessageStorage} from "@/modules/chat/persistence/message-storage.ts";

export interface LoadLocalChatsUsecase {
  (): Channel<Chat[]>;
}

export function createLoadLocalChatsUsecase(
  {chatStorage, messageStorage}: {
    chatStorage: ChatStorage;
    messageStorage: MessageStorage;
  }
): LoadLocalChatsUsecase {
  return () => launchChannel(async (channel) => {
    const list: Chat[] = [];

    for (const chat of await chatStorage.list()) {
      const lastMessage = await messageStorage.lastMessage({chatId: chat.id});

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

    channel.send(list);
  });
}

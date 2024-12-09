import {Message} from "@/modules/chat/logic/message.ts";
import {ChatListLogic} from "@/modules/chat-list/logic/chat-list-logic.ts";

export interface ChatListProps {
  chats: {
    name: string;
    lastMessage: Message;
    avatar: string;
    variant: "secondary" | "ghost";
  }[];
  onClick?: () => void;
}

export function useChatListProps(chatListLogic: ChatListLogic): ChatListProps {
  return {
    chats: [
      {
        name: "Public Chat",
        lastMessage: {
          localNonce: 0,
          serverNonce: 0,
          loading: false,
          failure: false,
          content: {
            type: "regular",
            author: false,
            title: "Alex Sokol",
            text: "Hello world"
          }
        },
        avatar: "Test",
        variant: "secondary"
      }
    ],
    onClick(): void {}
  }
}

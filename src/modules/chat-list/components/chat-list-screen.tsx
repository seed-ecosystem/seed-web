import {ChatListLogic} from "@/modules/chat-list/logic/chat-list-logic.ts";
import {useState} from "react";
import {Chat} from "@/modules/chat-list/logic/chat.ts";
import {useEach} from "@/modules/coroutines/channel/channel.ts";
import {ChatListContent} from "@/modules/chat-list/components/chat-list-content.tsx";

export function ChatListScreen({loadLocalChats}: ChatListLogic) {
  const [chats, setChats] = useState<Chat[]>([]);

  useEach(loadLocalChats, async (loaded) => {
    setChats(loaded);
  });

  return ChatListContent({
    chats: chats
  });
}

import {ChatListLogic} from "@/modules/chat-list/logic/chat-list-logic.ts";
import {useState} from "react";
import {ChatListContent} from "@/modules/chat-list/components/chat-list-content.tsx";
import {useEach} from "@/coroutines/observable.ts";

export function ChatListScreen({events, getChats}: ChatListLogic) {
  const [chats, updateChats] = useState(getChats());

  useEach(events, event => {
    switch (event.type) {
      case "chats":
        updateChats(event.value);
        break;
    }
  });

  return ChatListContent({
    chats: chats
  });
}

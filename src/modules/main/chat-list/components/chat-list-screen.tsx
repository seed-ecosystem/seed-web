import {ChatListLogic} from "@/modules/main/chat-list/logic/chat-list-logic.ts";
import {useEffect, useState} from "react";
import {ChatListContent} from "@/modules/main/chat-list/components/chat-list-content.tsx";
import {useEach} from "@/coroutines/observable.ts";

export function ChatListScreen({events, getChats, mount}: ChatListLogic) {
  const [chats, updateChats] = useState(getChats());

  useEach(events, event => {
    switch (event.type) {
      case "chats":
        updateChats(event.value);
        break;
    }
  });

  useEffect(mount, [mount]);

  return ChatListContent({
    chats: chats
  });
}

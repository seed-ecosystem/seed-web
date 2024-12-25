import {ChatListLogic} from "@/modules/chat-list/logic/chat-list-logic.ts";
import {useEffect, useMemo, useState} from "react";
import {Chat} from "@/modules/chat-list/logic/chat.ts";
import {useEach} from "@/modules/coroutines/channel/channel.ts";
import {ChatListContent} from "@/modules/chat-list/components/chat-list-content.tsx";

export function ChatListScreen({events, getChats}: ChatListLogic) {
  const [chats, updateChats] = useState(getChats());

  useEach(events, async event => {
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

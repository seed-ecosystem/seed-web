import { TopBarLogic } from "@/modules/main/top-bar/logic/top-bar-logic.ts";
import { useState } from "react";
import { useEach } from "@/coroutines/observable.ts";
import { TopBarContent } from "@/modules/main/top-bar/components/top-bar-content.tsx";
import { createChatTopBar } from "@/modules/main/top-bar/components/chat/create-chat-top-bar.tsx";
import { createChatListTopBar } from "@/modules/main/top-bar/components/chat-list/chat-list-top-bar.tsx";

export function TopBar(
  {
    events,
    getConnecting, getChat, getChatList,
  }: TopBarLogic,
) {
  const [loading, updateLoading] = useState(getConnecting);
  const [chat, updateChat] = useState(getChat);
  const [chatList] = useState(getChatList);

  useEach(events, event => {
    switch (event.type) {
      case "connecting":
        updateLoading(event.value);
        break;
      case "chat":
        updateChat(event.value);
        break;
    }
  });

  return TopBarContent({
    loading,
    chat: chat ? createChatTopBar(chat) : undefined,
    chatList: createChatListTopBar(chatList),
  });
}

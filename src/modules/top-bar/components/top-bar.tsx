import {TopBarLogic} from "@/modules/top-bar/logic/top-bar-logic.ts";
import {useState} from "react";
import {useEach} from "@/coroutines/observable.ts";
import {TopBarContent} from "@/modules/top-bar/components/top-bar-content.tsx";
import {createChatTopBar} from "@/modules/top-bar/components/chat/create-chat-top-bar.tsx";
import {ChatListTopBar} from "@/modules/top-bar/components/chat-list/chat-list-top-bar.tsx";

export function TopBar(
  {
    events,
    getConnecting, getChat, getChatList
  }: TopBarLogic
) {
  const [loading, updateLoading] = useState(getConnecting);
  const [chat, updateChat] = useState(getChat);
  const [chatList] = useState(getChatList);

  useEach(events, event => {
    switch(event.type) {
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
    ChatList: () => ChatListTopBar(chatList)
  });
}

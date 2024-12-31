import {MainLogic} from "@/modules/main/logic/main-logic.ts";
import {useLocation, useRoute} from "wouter";
import {useEffect, useMemo, useState} from "react";
import {MainContent} from "@/modules/main/components/main-content.tsx";
import {ChatScreen} from "@/modules/chat/components/chat-screen.tsx";
import {ChatListScreen} from "@/modules/chat-list/components/chat-list-screen.tsx";
import {ChatTopBar} from "@/modules/chat/components/top-bar/chat-top-bar.tsx";
import {ChatListTopBar} from "@/modules/chat-list/components/top-bar/chat-list-top-bar.tsx";
import {useEach} from "@/coroutines/observable.ts";
import {ChatLogic} from "@/modules/chat/logic/chat-logic.ts";

export function MainScreen({events, getLoading, openChat, closeChat, chatListLogic}: MainLogic) {
  const [, navigate] = useLocation();
  const [, chatParams] = useRoute("/chat/:chatId");
  const [chat, updateChat] = useState<ChatLogic>();
  const [loading, updateLoading] = useState(getLoading);

  useEffect(() => {
    if (chatParams?.chatId === undefined) {
      closeChat();
    } else {
      openChat({chatId: decodeURIComponent(chatParams.chatId)});
    }
  }, [chatParams?.chatId]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.code == "Escape") {
        closeChat();
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);

  useEach(events, async event => {
    switch (event.type) {
      case "loading":
        updateLoading(event.value);
        break;
      case "chat":
        updateChat(event.value);
        break;
      case "closeChat":
        navigate("");
        break;
    }
  });

  return MainContent({
    loading,
    closeChat,
    ChatTopBar: chat ? () => ChatTopBar(chat.topBar) : undefined,
    ChatScreen: chat ? () => ChatScreen(chat) : undefined,
    ChatListTopBar: () => ChatListTopBar(chatListLogic.topBar),
    ChatListScreen: () => ChatListScreen(chatListLogic),
  });
}

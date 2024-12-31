import {MainLogic} from "@/modules/main/logic/main-logic.ts";
import {useRoute} from "wouter";
import {useEffect, useMemo, useState} from "react";
import {MainContent} from "@/modules/main/components/main-content.tsx";
import {ChatScreen} from "@/modules/chat/components/chat-screen.tsx";
import {ChatListScreen} from "@/modules/chat-list/components/chat-list-screen.tsx";
import {ChatTopBar} from "@/modules/chat/components/top-bar/chat-top-bar.tsx";
import {ChatListTopBar} from "@/modules/chat-list/components/top-bar/chat-list-top-bar.tsx";
import {launch} from "@/modules/coroutines/launch.ts";
import {useEach} from "@/coroutines/observable.ts";
import {ChatLogic} from "@/modules/chat/logic/chat-logic.ts";

export function MainScreen({events, getLoading, createChat, chatListLogic}: MainLogic) {
  const [_, chatParams] = useRoute("/chat/:chatId");
  const [chat, updateChat] = useState<ChatLogic>();
  const [loading, updateLoading] = useState(getLoading);

  useEffect(() => {
    if (!chatParams) return;
    let cancelled = false;
    launch(async () => {
      const chat = await createChat({chatId: decodeURIComponent(chatParams.chatId)});
      if (cancelled) return;
      updateChat(chat);
    });
    return () => { cancelled = true; };
  }, [chatParams?.chatId]);

  useEach(events, async event => {
    switch (event.type) {
      case "loading":
        updateLoading(event.value);
        break;
    }
  });

  return MainContent({
    loading,
    ChatTopBar: chat ? () => ChatTopBar(chat.topBar) : undefined,
    ChatScreen: chat ? () => ChatScreen(chat) : undefined,
    ChatListTopBar: () => ChatListTopBar(chatListLogic.topBar),
    ChatListScreen: () => ChatListScreen(chatListLogic),
  });
}

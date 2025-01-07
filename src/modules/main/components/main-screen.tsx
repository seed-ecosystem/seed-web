import {MainLogic} from "@/modules/main/logic/main-logic.ts";
import {useLocation, useRoute} from "wouter";
import {useEffect, useState} from "react";
import {MainContent} from "@/modules/main/components/main-content.tsx";
import {ChatScreen} from "@/modules/chat/components/chat-screen.tsx";
import {ChatListScreen} from "@/modules/chat-list/components/chat-list-screen.tsx";
import {useEach} from "@/coroutines/observable.ts";
import {TopBar} from "@/modules/top-bar/components/top-bar.tsx";
import {CreateChat} from "@/modules/new-chat/component/create-chat.tsx";

export function MainScreen(
  {
    events,

    getTopBar, getChat,
    getChatList, getCreateChat,

    openChat, closeChat,
    openCreateChat, closeCreateChat,

    escape
  }: MainLogic
) {
  const [, navigate] = useLocation();

  const [topBar] = useState(getTopBar);
  const [chatList] = useState(getChatList);
  const [chat, updateChat] = useState(getChat);
  const [createChat, updateCreateChat] = useState(getCreateChat);

  const [, chatParams] = useRoute("/chat/:chatId");

  useEffect(() => {
    if (chatParams?.chatId === undefined) {
      closeChat();
    } else {
      openChat({chatId: decodeURIComponent(chatParams.chatId)});
    }
  }, [chatParams?.chatId]);

  const [createMatch] = useRoute("/create");

  useEffect(() => {
    if (createMatch) {
      openCreateChat();
    } else {
      closeCreateChat();
    }
  }, [createMatch]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.code == "Escape") {
        escape();
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);

  useEach(events, async event => {
    switch (event.type) {
      case "chat":
        updateChat(event.value);
        if (!event.value) {
          navigate("");
        }
        break;
      case "createChat":
        updateCreateChat(event.value);
        break;
    }
  });

  return MainContent({
    TopBar: () => TopBar(topBar),
    ChatScreen: chat ? () => ChatScreen(chat) : undefined,
    ChatListScreen: () => ChatListScreen(chatList),
    CreateChat: createChat ? () => CreateChat(createChat) : undefined,
  });
}

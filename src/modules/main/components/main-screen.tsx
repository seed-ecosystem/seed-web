import {MainLogic} from "@/modules/main/logic/main-logic.ts";
import {useLocation, useRoute, useRouter} from "wouter";
import {useEffect, useState} from "react";
import {MainContent} from "@/modules/main/components/main-content.tsx";
import {ChatScreen} from "@/modules/main/chat/components/chat-screen.tsx";
import {ChatListScreen} from "@/modules/main/chat-list/components/chat-list-screen.tsx";
import {useEach} from "@/coroutines/observable.ts";
import {TopBar} from "@/modules/main/top-bar/components/top-bar.tsx";
import {CreateChat} from "@/modules/main/new/component/create-chat.tsx";
import {ShareChatContent} from "@/modules/main/share/component/share-chat-content.tsx";
import {ShareChat} from "@/modules/main/share/component/share-content.tsx";

export function MainScreen(
  {
    events,

    getTopBar,
    getChatList,

    getChat, bindChat,
    getCreateChat,
    getShareChat,

    escape
  }: MainLogic
) {
  const [, navigate] = useLocation();

  const [topBar] = useState(getTopBar);
  const [chatList] = useState(getChatList);
  const [chat, updateChat] = useState(getChat);
  const [createChat, updateNew] = useState(getCreateChat);
  const [shareChat, updateShare] = useState(getShareChat);

  const [, chatParams] = useRoute("/chat/:chatId/*?");

  useEach(events, async event => {
    switch (event.type) {
      case "chat":
        if (!event.value) {
          navigate("/");
        }
        updateChat(event.value);
        break;
      case "new":
        updateNew(event.value);
        break;
      case "share":
        updateShare(event.value);
        break;
    }
  });

  useEffect(() => {
    if (chatParams?.chatId === undefined) {
      bindChat(undefined);
    } else {
      bindChat(decodeURIComponent(chatParams.chatId));
    }
  }, [chatParams?.chatId]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.code == "Escape") {
        escape();
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);

  return MainContent({
    TopBar: () => TopBar(topBar),
    ChatScreen: chat ? () => ChatScreen(chat) : undefined,
    ChatListScreen: () => ChatListScreen(chatList),
    CreateChat: createChat ? () => CreateChat(createChat) : undefined,
    ShareChat: shareChat ? () => ShareChat(shareChat) : undefined,
  });
}

import {MainLogic} from "@/modules/main/logic/main-logic.ts";
import {useRoute} from "wouter";
import {useMemo} from "react";
import {MainContent} from "@/modules/main/components/main-content.tsx";
import {ChatScreen} from "@/modules/chat/components/chat-screen.tsx";
import {ChatListScreen} from "@/modules/chat-list/components/chat-list-screen.tsx";

export function MainScreen({createChat, chatListLogic}: MainLogic) {
  const [_, chatParams] = useRoute("/chat/:chatId");

  const chatLogic = useMemo(
    () => chatParams ? createChat({chatId: decodeURIComponent(chatParams.chatId)}) : null,
    [chatParams]
  );

  return MainContent({
    ChatScreen: chatLogic ? () => ChatScreen(chatLogic) : undefined,
    ChatListScreen: () => ChatListScreen(chatListLogic),
  });
}

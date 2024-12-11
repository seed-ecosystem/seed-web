import {MainLogic} from "@/modules/main/logic/main-logic.ts";
import {useRoute} from "wouter";
import {useMemo} from "react";
import {MainContent} from "@/modules/main/components/main-content.tsx";
import {ChatScreen} from "@/modules/chat/components/chat-screen.tsx";
import {ChatListScreen} from "@/modules/chat-list/components/chat-list-screen.tsx";

export function MainScreen({createChat, chatListLogic}: MainLogic) {
  const [showChat] = useRoute("/chat/bHKhl2cuQ01pDXSRaqq%2FOMJeDFJVNIY5YuQB2w7ve%2Bc%3D");

  const chatLogic = useMemo(
    () => showChat ? createChat() : null,
    [showChat]
  );

  return MainContent({
    ChatScreen: chatLogic ? () => ChatScreen(chatLogic) : undefined,
    ChatListScreen: () => ChatListScreen(chatListLogic),
  });
}

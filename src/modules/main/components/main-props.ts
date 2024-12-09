import {ChatProps, useChatProps} from "@/modules/chat/components/chat-props.ts";
import {MainLogic} from "@/modules/main/logic/main-logic.ts";
import {useRoute} from "wouter";
import {useMemo} from "react";
import {ChatListProps, useChatListProps} from "@/modules/chat-list/components/chat-list-props.ts";

export interface MainProps {
  chatListProps: ChatListProps;
  chatProps: ChatProps | null;
}

export function useMainProps(
  {createChat, chatListLogic}: MainLogic
): MainProps {
  const [showChat] = useRoute("/beta");

  const chatLogic = useMemo(
    () => showChat ? createChat() : null,
    [showChat]
  );

  return {
    chatListProps: useChatListProps(chatListLogic),
    chatProps: chatLogic ? useChatProps(chatLogic) : null,
  };
}

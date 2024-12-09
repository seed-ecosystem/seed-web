import {ChatProps, useChatProps} from "@/modules/chat/components/chat-props.ts";
import {ChatListLogic} from "@/modules/chat-list/logic/chat-list-logic.ts";
import {useRoute} from "wouter";
import {useMemo} from "react";

export interface ChatListProps {
  chatProps: ChatProps | null;
}

export function useChatListProps(
  {createChat}: ChatListLogic
): ChatListProps {
  const [showChat] = useRoute("/beta");

  const chatLogic = useMemo(
    () => showChat ? createChat() : null,
    [showChat]
  );

  return {
    chatProps: chatLogic ? useChatProps(chatLogic) : null,
  };
}

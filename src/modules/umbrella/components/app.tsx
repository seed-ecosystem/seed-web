import {Logic} from "@/modules/umbrella/logic/logic.ts";
import {useMemo} from "react";
import {useChatListProps} from "@/modules/chat-list/components/chat-list-props.ts";
import {ChatListContent} from "@/modules/chat-list/components/chat-list-content.tsx";

export function App({logic}: {logic: Logic}) {
  const chatListLogic = useMemo(() => logic.createChatList(), [logic]);
  const chatListProps = useChatListProps(chatListLogic);

  return <ChatListContent {...chatListProps} />;
}

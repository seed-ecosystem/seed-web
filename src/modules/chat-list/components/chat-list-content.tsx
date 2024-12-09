import {ChatListProps} from "@/modules/chat-list/components/chat-list-props.ts";
import {MediaHiddenSM, MediaVisibleSM} from "@/modules/responsive/media-query.tsx";
import {ChatContent} from "@/modules/chat/components/chat-content.tsx";


export function ChatListContent({chatProps}: ChatListProps) {
  return <div className="h-svh">

    <MediaHiddenSM>
      {chatProps ? <ChatContent {...chatProps} /> : (<ChatList/>)}
    </MediaHiddenSM>

    <MediaVisibleSM>
      <ChatList/>
      {chatProps ? <ChatContent {...chatProps} /> : <NoChatSelected/>}
    </MediaVisibleSM>
  </div>;
}

function ChatList() {
  return <></>;
}

function NoChatSelected() {
  return <></>;
}

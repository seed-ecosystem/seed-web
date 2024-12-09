import {MediaHiddenMD, MediaVisibleMD} from "@/modules/responsive/media-query.tsx";
import {ChatContent} from "@/modules/chat/components/chat-content.tsx";
import {MainProps} from "@/modules/main/components/main-props.ts";
import {ChatListContent} from "@/modules/chat-list/components/chat-list-content.tsx";

export function MainContent({chatProps, chatListProps}: MainProps) {
  return <div className="h-svh">

    <MediaHiddenMD>
      {chatProps ? <ChatContent {...chatProps} /> : (<ChatListContent {...chatListProps} />)}
    </MediaHiddenMD>

    <MediaVisibleMD>
      <div className="h-svh flex">
        <ChatListContent {...chatListProps} />
        <div className="flex-grow min-w-0 relative">
          {chatProps ? <ChatContent {...chatProps} /> : <></>}
        </div>
      </div>
    </MediaVisibleMD>
  </div>;
}

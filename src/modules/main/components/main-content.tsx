import {MediaHiddenMD, MediaVisibleMD} from "@/modules/responsive/media-query.tsx";
import {ReactElement} from "react";
import {TopBarContent} from "@/modules/top-bar/top-bar-content.tsx";

export interface MainProps {
  loading: boolean;
  ChatListTopBar: () => ReactElement;
  ChatListScreen: () => ReactElement;
  ChatTopBar?: () => ReactElement;
  ChatScreen?: () => ReactElement;
}

export function MainContent({loading, ChatListTopBar, ChatListScreen, ChatTopBar, ChatScreen}: MainProps) {
  return <div className="h-svh flex flex-col">
    <TopBarContent loading={loading} Chat={ChatTopBar} ChatList={ChatListTopBar} />

    <MediaHiddenMD>
      {ChatScreen ? <ChatScreen /> : (<ChatListScreen />)}
    </MediaHiddenMD>

    <MediaVisibleMD>
      <div className="flex flex-1">
        <ChatListScreen />
        <div className="flex-1 min-w-0 relative">
          {ChatScreen ? <ChatScreen /> : NoChatSelected()}
        </div>
      </div>
    </MediaVisibleMD>
  </div>;
}

function NoChatSelected() {
  return <>
    <div className="w-full h-full flex justify-center items-center">
      <h1 className="text-xl text-muted-foreground">Select a Chat</h1>
    </div>
  </>;
}

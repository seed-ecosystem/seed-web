import {MediaHiddenMD, MediaVisibleMD} from "@/modules/responsive/media-query.tsx";
import {ReactElement} from "react";

export interface MainProps {
  ChatListScreen: () => ReactElement;
  ChatScreen?: () => ReactElement;
}

export function MainContent({ChatListScreen, ChatScreen}: MainProps) {
  return <div className="h-svh">

    <MediaHiddenMD>
      {ChatScreen ? <ChatScreen /> : (<ChatListScreen />)}
    </MediaHiddenMD>

    <MediaVisibleMD>
      <div className="h-svh flex">
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

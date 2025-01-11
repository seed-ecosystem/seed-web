import {MediaHiddenMD, MediaVisibleMD} from "@/modules/responsive/media-query.tsx";
import {ReactElement} from "react";

export interface MainProps {
  TopBar: () => ReactElement;
  ChatListScreen: () => ReactElement;
  ChatScreen?: () => ReactElement;
  CreateChat?: () => ReactElement;
  ShareChat?: () => ReactElement;
  DeleteChat?: () => ReactElement;
}

export function MainContent({TopBar, ChatListScreen, ChatScreen, CreateChat, ShareChat, DeleteChat}: MainProps) {
  return <div className="h-svh flex flex-col">
    <TopBar />

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

    {CreateChat && <CreateChat />}
    {ShareChat && <ShareChat />}
    {DeleteChat && <DeleteChat />}
  </div>;
}

function NoChatSelected() {
  return <>
    <div className="w-full h-full flex justify-center items-center">
      <h1 className="text-xl text-muted-foreground">Select a Chat</h1>
    </div>
  </>;
}

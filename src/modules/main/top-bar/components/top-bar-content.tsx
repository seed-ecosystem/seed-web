import {Link} from "wouter";
import {LoadingSpinner} from "@/modules/core/components/loading-spinner.tsx";
import {ReactElement} from "react";
import {MediaHiddenMD, MediaVisibleMD} from "@/modules/responsive/media-query.tsx";

export type TopBarProps = {
  loading: boolean;
  chat?: ChatTopBar;
  chatList: ChatListTopBar;
}

export type ChatTopBar = {
  Menu: () => ReactElement;
  Close: () => ReactElement;
  Content: () => ReactElement;
}

export type ChatListTopBar = {
  Create: () => ReactElement;
  Content: () => ReactElement;
}

export function TopBarContent({loading, chat, chatList}: TopBarProps) {
  return (
    <div className="flex h-14 w-full border-b border-border/40 bg-background/95 items-center px-4">
      <Logo />
      <div className="flex h-full justify-center items-center flex-1 mx-4 relative">
        {loading
          ? <Connecting />
          : chat === undefined
            ? <chatList.Content />
            : <chat.Content />}
      </div>
      {chat === undefined
        ? <chatList.Create/>
        : <chat.Menu/>
      }
    </div>
  );
}

function Connecting() {
  return <div className="w-full h-full flex justify-center items-center"><p
    className="overflow-hidden text-ellipsis">Connecting...</p><LoadingSpinner className="size-4"/>
  </div>;
}

function Logo() {
  return <h1 className="text-2xl font-medium"><Link to="/">Seed</Link></h1>;
}

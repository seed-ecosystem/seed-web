import {Link} from "wouter";
import {Button} from "@/modules/core/components/button.tsx";
import {Plus} from "lucide-react";
import {LoadingSpinner} from "@/modules/core/components/loading-spinner.tsx";
import {ReactElement} from "react";
import {MediaHiddenMD, MediaVisibleMD} from "@/modules/responsive/media-query.tsx";

export type TopBarProps = {
  loading: boolean;
  chat?: ChatTopBar;
  ChatList: () => ReactElement;
}

export type ChatTopBar = {
  Menu: () => ReactElement;
  Close: () => ReactElement;
  Content: () => ReactElement;
}

export function TopBarContent({loading, chat, ChatList}: TopBarProps) {
  return (
    <div className="flex h-14 w-full border-b border-border/40 bg-background/95 items-center px-4">
      <Logo />
      <div className="flex h-full justify-center items-center flex-1 mx-4 relative">
        {loading
          ? <Connecting />
          : chat === undefined
            ? <ChatList />
            : <chat.Content />}
      </div>
      {chat === undefined
        ? <CreateChat />
        : <div>
          <MediaVisibleMD>
            <chat.Menu />
          </MediaVisibleMD>
          <MediaHiddenMD>
            <chat.Close />
          </MediaHiddenMD>
          {/*<div className="hidden md:block"><CreateChat /></div>*/}
          {/*<div className="md:hidden"><CloseChat onClick={closeChat}/></div>*/}
          {/*TODO: Support creation of new chat from chat*/}
        </div>
      }
    </div>
  );
}

function CreateChat() {
  return <Link to="/create">
    <Button size="icon" variant="ghost">
      <Plus />
    </Button>
  </Link>;
}

function Connecting() {
  return <div className="w-full h-full flex justify-center items-center"><p
    className="overflow-hidden text-ellipsis">Connecting...</p><LoadingSpinner className="size-4"/>
  </div>;
}

function Logo() {
  return <h1 className="text-2xl font-medium"><Link to="/">Seed</Link></h1>;
}

import {LoadingSpinner} from "@/modules/core/components/loading-spinner.tsx";
import {ReactElement} from "react";
import {Link} from "wouter";
import {Plus, X} from "lucide-react";
import {Button} from "@/modules/core/components/button.tsx";

export interface TopBarProps {
  loading: boolean;
  closeChat: () => void;
  ChatList: () => ReactElement;
  Chat?: () => ReactElement;
}

export function TopBarContent({loading, closeChat, Chat, ChatList}: TopBarProps) {
  return (
    <div className="flex h-14 w-full border-b border-border/40 bg-background/95 items-center px-4">
      <h1 className="text-2xl font-medium"><Link to="/">Seed</Link></h1>
      <div className="flex h-full justify-center items-center flex-1 mx-4 relative">
        {loading
          ? <Connecting />
          : Chat
            ? <Chat />
            : <ChatList />}
      </div>
      {Chat
        ? <>
          {/*<div className="hidden md:block"><CreateChat /></div>*/}
          {/*<div className="md:hidden"><CloseChat onClick={closeChat}/></div>*/}
          {/*TODO: Support creation of new chat from chat*/}
          <div><CloseChat onClick={closeChat}/></div>
        </>
        : <CreateChat/>
      }
    </div>
  );
}

function Connecting() {
  return <div className="w-full h-full flex justify-center items-center"><p
      className="overflow-hidden text-ellipsis">Connecting...</p><LoadingSpinner className="size-4"/>
  </div>;
}

export type CloseChatProps = {
  onClick(): void;
}

function CloseChat({onClick}: CloseChatProps) {
  return <Button size="icon" variant="ghost" onClick={onClick}><X/></Button>;
}

function CreateChat() {
  return <Link to="/create">
    <Button size="icon" variant="ghost">
      <Plus />
    </Button>
  </Link>;
}

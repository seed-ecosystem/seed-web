import {Link} from "wouter";
import {Button} from "@/modules/core/components/button.tsx";
import {Plus, X} from "lucide-react";
import {LoadingSpinner} from "@/modules/core/components/loading-spinner.tsx";
import {ReactElement} from "react";

export interface TopBarProps {
  loading: boolean;
  closeChat: () => void;
  Chat?: () => ReactElement;
  ChatList: () => ReactElement;
}

export function TopBarContent({loading, closeChat, Chat, ChatList}: TopBarProps) {
  return (
    <div className="flex h-14 w-full border-b border-border/40 bg-background/95 items-center px-4">
      <Logo />
      <div className="flex h-full justify-center items-center flex-1 mx-4 relative">
        {loading
          ? <Connecting />
          : Chat === undefined
            ? <ChatList />
            : <Chat />}
      </div>
      {Chat === undefined
        ? <CreateChat />
        : <>
          {/*<div className="hidden md:block"><CreateChat /></div>*/}
          {/*<div className="md:hidden"><CloseChat onClick={closeChat}/></div>*/}
          {/*TODO: Support creation of new chat from chat*/}
          <div><CloseChat onClick={closeChat}/></div>
        </>
      }
    </div>
  );
}

type CloseChatProps = {
  onClick(): void;
}

function CloseChat({onClick}: CloseChatProps) {
  return <Button size="icon" variant="ghost" onClick={onClick}><X /></Button>;
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

import {ImportChat} from "@/modules/top-bar/import-chat.tsx";
import {motion, AnimatePresence} from "framer-motion";
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
        <AnimatePresence>
          {loading ? <Connecting/>
            : Chat ? <Chat />
              : <ChatList />}
        </AnimatePresence>
      </div>
      {Chat
        ? <>
          <div className="hidden md:block"><ImportChat/></div>
          <div className="md:hidden"><CloseChat onClick={closeChat}/></div>
        </>
        : <ImportChat/>
      }
    </div>
  )
}

function Connecting() {
  return <motion.div className="absolute left-0 right-0" key="loader" exit={{y: -10, opacity: 0}}>
    <div className="w-full h-full flex justify-center items-center"><p
      className="overflow-hidden text-ellipsis">Connecting...</p><LoadingSpinner className="size-4"/></div>
  </motion.div>;
}

export type CloseChatProps = {
  onClick(): void;
}

function CloseChat({onClick}: CloseChatProps) {
  return <Button size="icon" variant="ghost" onClick={onClick}><X/></Button>
}

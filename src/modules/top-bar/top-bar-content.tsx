import {ImportChat} from "@/modules/chat/components/import-chat.tsx";
import {motion, AnimatePresence} from "framer-motion";
import {LoadingSpinner} from "@/modules/core/components/loading-spinner.tsx";
import {ReactElement} from "react";

export interface TopBarProps {
  loading: boolean;
  ChatList: () => ReactElement;
  Chat?: () => ReactElement;
}

export function TopBarContent({loading, Chat, ChatList}: TopBarProps) {
  return (
    <div className="flex h-14 w-full border-b border-border/40 bg-background/95 items-center px-4">
      <h1 className="text-2xl font-medium">Seed</h1>
      <div className="flex h-full justify-center items-center flex-1 mx-4 relative">
        <AnimatePresence>
          {loading ? <Connecting/>
            : Chat ? <Chat />
              : <ChatList />}
        </AnimatePresence>
      </div>
      <ImportChat/>
    </div>
  )
}

function Connecting() {
  return <motion.div className="absolute left-0 right-0" key="loader" exit={{y: -10, opacity: 0}}>
    <div className="w-full h-full flex justify-center items-center"><p
      className="overflow-hidden text-ellipsis">Connecting...</p><LoadingSpinner className="size-4"/></div>
  </motion.div>;
}

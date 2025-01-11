import {LoadingSpinner} from "@/modules/core/components/loading-spinner.tsx";
import {Button} from "@/modules/core/components/button.tsx";
import {Forward, LogOut, Menu, MessageSquareX, Share, X} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";

export interface ChatTopBarProps {
  waiting: boolean;
  title: string;
}

export function ChatTopBarContent({waiting, title}: ChatTopBarProps) {
  return waiting
    ? <div className="w-full h-full flex justify-center items-center">
      <h4 className="text-lg font-medium">{title}</h4>
    </div>
    : <Updating/>
}

function Updating() {
  return <>
    <div className="w-full h-full flex justify-center items-center"><p
      className="overflow-hidden text-ellipsis">Updating...</p><LoadingSpinner className="size-4"/></div>
  </>;
}

export type ChatTopBarCloseProps = {
  closeChat: () => void;
}

export function ChatTopBarCloseContent({closeChat}: ChatTopBarCloseProps) {
  return <Button size="icon" variant="ghost" onClick={closeChat}><X /></Button>;
}

export type ChatTopBarMenuProps = {
  shareChat: () => void;
  deleteChat: () => void;
}

export function ChatTopBarMenuContent({shareChat, deleteChat}: ChatTopBarMenuProps) {
  return <DropdownMenu>
    <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><Menu /></Button></DropdownMenuTrigger>
    <DropdownMenuContent side="left" align="start">
      <DropdownMenuLabel>Options</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={shareChat}><Forward/> Share Chat</DropdownMenuItem>
      <DropdownMenuItem onClick={deleteChat}><MessageSquareX/> Leave Chat</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}

import {Link} from "wouter";
import {Avatar, AvatarFallback, AvatarImage} from "@/modules/core/components/avatar.tsx";
import {convertTitleToAvatar} from "@/convert-title-to-avatar.ts";
import {Chat} from "@/modules/main/chat-list/logic/chat.ts";

export interface ChatListProps {
  chats: Chat[];
}

export function ChatListContent({chats}: ChatListProps) {
  return (
    <div
      className="relative group flex flex-col h-full dark:bg-muted/20 gap-4 p-2">
      <nav className="flex flex-col gap-1 px-2">
        {chats.map((chat) => {
          const active = chat.isActive ?? false;

          return <Link
            key={chat.id}
            href={`/chat/${encodeURIComponent(chat.id)}`}
            data-active={active}
            className={`data-[active=true]:bg-foreground/[9%] flex flex-row items-center px-2 py-2 gap-2 whitespace-nowrap rounded-md text-sm font-medium`}>
            <Avatar className="flex justify-center items-center">
              <AvatarFallback className="text-muted-foreground">{convertTitleToAvatar(chat.title)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col md:max-w-40 min-w-0 flex-1">
              <span>{chat.title}</span>
              {chat.lastMessage && (
                <span className="text-muted-foreground text-xs truncate me-2">
                {chat.lastMessage.title.split(" ")[0]}
                  :{" "}
                  {chat.lastMessage.text}
              </span>
              )}
            </div>
          </Link>
        })}
      </nav>
    </div>
  );
}

import {Link} from "wouter";
import {Avatar, AvatarFallback, AvatarImage} from "@/modules/core/components/avatar.tsx";
import {convertTitleToAvatar} from "@/convert-title-to-avatar.ts";
import {UiChat} from "@/modules/main/chat-list/logic/chat.ts";

export interface ChatListProps {
  chats: UiChat[];
}

export function ChatListContent({chats}: ChatListProps) {
  return (
    <div
      className="relative group flex flex-col h-full dark:bg-muted/20 gap-4 p-2">
      <nav className="flex flex-col gap-1 px-2">
        {chats.map((chat) => {

          return <Link
            key={chat.id}
            href={`/chat/${encodeURIComponent(chat.id)}`}
            data-active={chat.isActive}
            className={`data-[active=true]:bg-foreground/[9%] flex flex-row md:w-64 items-center px-2 py-2 gap-2 whitespace-nowrap rounded-md text-sm`}>
            <Avatar className="flex justify-center items-center">
              <AvatarFallback className="text-muted-foreground">{convertTitleToAvatar(chat.title)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium">{chat.title}</span>
              {chat.lastMessage && (
                <span className="text-muted-foreground text-xs truncate line-clamp-2 whitespace-pre-wrap">
                <span className="font-medium">{chat.lastMessage.title.split(" ")[0]}</span>
                  :{" "}
                  {chat.lastMessage.text}
              </span>
              )}
            </div>
            {chat.unreadCount > 0 && <UnreadBadge count={chat.unreadCount} />}
          </Link>
        })}
      </nav>
    </div>
  );
}

export type UnreadBadgeProps = {
  count: number;
}

function UnreadBadge({count}: UnreadBadgeProps) {
  return <span className="bg-primary py-1 px-2 rounded-full text-primary-foreground text-center content-center text-xs min-w-6 h-6">{count}</span>
}

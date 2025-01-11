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
      className="relative group flex flex-col h-full bg-muted/10 dark:bg-muted/20 gap-4 p-2 data-[collapsed=true]:p-2 ">
      <nav className="grid justify-between gap-1 px-2">
        {chats.map((chat) =>
          <Link
            key={chat.id}
            href={`/chat/${encodeURIComponent(chat.id)}`}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
          >
            <Avatar className="flex justify-center items-center">
              <AvatarFallback className="text-muted-foreground">{convertTitleToAvatar(chat.title)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col max-w-28 flex-1">
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
        )}
      </nav>
    </div>
  );
}

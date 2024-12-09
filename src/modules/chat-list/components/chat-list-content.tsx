import {ChatListProps} from "@/modules/chat-list/components/chat-list-props.ts";
import {MoreHorizontal, SquarePen} from "lucide-react";
import {Link} from "wouter";
import {cn} from "@/lib/utils.ts";
import {buttonVariants} from "@/modules/core/components/button.tsx";
import {Avatar, AvatarImage} from "@/modules/core/components/avatar.tsx";
import {RegularContent} from "@/modules/crypto/message-content/regular-content.ts";

export function ChatListContent({chats}: ChatListProps) {
  return (
    <div
      className="relative group flex flex-col h-full bg-muted/10 dark:bg-muted/20 gap-4 p-2 data-[collapsed=true]:p-2 "
    >
      <div className="flex justify-between p-2 items-center">
        <div className="flex gap-2 items-center text-2xl">
          <p className="font-medium">Chats</p>
          <span className="text-zinc-300">({chats.length})</span>
        </div>

        <div>
          <Link
            href="#"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9",
            )}
          >
            <MoreHorizontal size={20} />
          </Link>

          <Link
            href="#"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9",
            )}
          >
            <SquarePen size={20} />
          </Link>
        </div>
      </div>
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {chats.map((chat, index) =>
          <Link
            key={index}
            href="#"
            className={cn(
              buttonVariants({ variant: chat.variant, size: "lg" }),
              chat.variant === "secondary" &&
              "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
              "justify-start gap-4",
            )}
          >
            <Avatar className="flex justify-center items-center">
              <AvatarImage
                src={chat.avatar}
                alt={chat.avatar}
                width={6}
                height={6}
                className="w-10 h-10 "
              />
            </Avatar>
            <div className="flex flex-col max-w-28">
              <span>{chat.name}</span>
              {chat.lastMessage && (
                <span className="text-zinc-300 text-xs truncate ">
                  {(chat.lastMessage.content as RegularContent)?.title?.split(" ")[0]}
                  :{" "}
                  {(chat.lastMessage.content as RegularContent)?.text}
                </span>
              )}
            </div>
          </Link>
        )}
      </nav>
    </div>
  );
}

function NoChatSelected() {
  return <></>;
}

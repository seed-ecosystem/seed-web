import * as React from "react";
import { cn } from "@/lib/utils";
import InfiniteScroll from "react-infinite-scroll-component";
import {Props} from "react-infinite-scroll-component/src";

interface ChatMessageListProps extends Props {}

const ChatMessageList = React.forwardRef<InfiniteScroll, ChatMessageListProps>(
  ({ className, children, ...props }, ref) => (
    // https://tanstack.com/virtual/latest
    <InfiniteScroll
      scrollableTarget="chatMessageListScroll"
      ref={ref}
      inverse={true}
      endMessage={
        <div className="h-8"/>
      }
      className={cn(
        "flex flex-col w-full h-full p-4 gap-6",
        className,
      )}
      {...props}
    >
      {children}
    </InfiniteScroll>
  ),
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };

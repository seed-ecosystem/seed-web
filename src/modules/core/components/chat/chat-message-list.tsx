import * as React from "react";
import { cn } from "@/lib/utils.ts";
import InfiniteScroll from "react-infinite-scroll-component";
import { Props } from "react-infinite-scroll-component";
import { LoadingSpinner } from "@/modules/core/components/loading-spinner.tsx";

type ChatMessageListProps = Props

const ChatMessageList = React.forwardRef<InfiniteScroll, Omit<ChatMessageListProps, "loader">>(
  ({ className, children, ...props }, ref) => (
    // https://tanstack.com/virtual/latest
    <InfiniteScroll
      scrollableTarget="chatMessageListScroll"
      ref={ref}
      inverse={true}
      loader={
        <>
          <div className="w-full flex justify-center"><LoadingSpinner /></div>
          <div className="h-8" />
        </>
      }
      endMessage={

        <div className="h-8" />
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

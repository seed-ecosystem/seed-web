import {ChatBubble, ChatBubbleAvatar, ChatBubbleMessage} from "@/components/ui/chat/chat-bubble.tsx";
import {Message} from "@/usecase/chat/message/message.ts";
import {ChatMessageList} from "@/components/ui/chat/chat-message-list.tsx";
import * as React from "react";

export function MessagesList(
  {messages, hasMore, next}: {
    messages: Message[];
    hasMore: boolean;
    next(): void;
  }
) {
  return <>
    <div className="flex flex-col-reverse flex-grow h-0 overflow-y-scroll">
      <ChatMessageList
        dataLength={messages.length}
        next={next}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        style={{ display: 'flex', flexDirection: 'column-reverse' }}
      >
        {messages.map((message) => {
          const variant = message.isAuthor ? 'sent' : 'received';

          return <ChatBubble variant={variant}>
            <ChatBubbleAvatar fallback={message.content.title}/>
            <ChatBubbleMessage variant={variant}>{message.content.text}</ChatBubbleMessage>
          </ChatBubble>
        })}
      </ChatMessageList>
    </div>
  </>;
}

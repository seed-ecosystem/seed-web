import {ChatBubble, ChatBubbleAvatar, ChatBubbleMessage} from "@/components/ui/chat/chat-bubble.tsx";
import {Message} from "@/usecase/chat/message/message.ts";
import {ChatMessageList} from "@/components/ui/chat/chat-message-list.tsx";
import * as React from "react";
import {Label} from "@/components/ui/label.tsx";
import {LoadingSpinner} from "@/components/ui/loading-spinner.tsx";

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

          const key = "server" in message.nonce
            ? `server:${message.nonce.server}`
            : `local:${message.nonce.local}`;

          const titleWords: string[] = message.content.title.split(" ");
          const avatar = titleWords
            .filter((word) => word.length > 0)
            .map((word) => word[0].toUpperCase())
            .join("");

          return <ChatBubble variant={variant} key={key}>
            <ChatBubbleAvatar fallback={avatar}/>
            <ChatBubbleMessage variant={variant}>
              <Label htmlFor="text">{message.content.title}</Label>
              <p id="text">{message.content.text}</p>
            </ChatBubbleMessage>
            {message.isSending && <LoadingSpinner/>}
          </ChatBubble>
        })}
      </ChatMessageList>
    </div>
  </>;
}

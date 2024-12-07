import {ChatBubble, ChatBubbleAvatar, ChatBubbleMessage} from "@/modules/core/components/chat/chat-bubble.tsx";
import {ChatMessageList} from "@/modules/core/components/chat/chat-message-list.tsx";
import * as React from "react";
import {Label} from "@/modules/core/components/label.tsx";
import {LoadingSpinner} from "@/modules/core/components/loading-spinner.tsx";
import {CircleX} from "lucide-react";
import {Message} from "@/modules/chat/logic/message.ts";

export function MessagesList(
  {messages}: {
    messages: Message[];
  }
) {
  return <>
    <div className="flex flex-col-reverse flex-grow h-0 w-full overflow-y-scroll no-scrollbar" id="chatMessageListScroll">

      <ChatMessageList
        dataLength={messages.length}
        next={() => {}}
        hasMore={false}
        style={{display: 'flex', flexDirection: 'column-reverse'}}>
        {messages.map((message) => {
          if (message.content.type != "regular") return;

          const variant = message.content.author ? 'sent' : 'received';

          const key = `${message.localNonce}`;

          const alphanumeric = message.content.title.replace(/[^\p{L}\d\s]/gu, '')

          const titleWords: string[] = [];

          if (alphanumeric.trim().length == 0) {
            titleWords.push(...message.content.title);
          } else {
            titleWords.push(...alphanumeric.split(" "));
          }

          const avatar = titleWords
            .slice(0, 3)
            .filter((word) => word.length > 0)
            .map((word) => word[0].toUpperCase())
            .join("");

          return <ChatBubble variant={variant} key={key}>
            <ChatBubbleAvatar fallback={avatar}/>
            <ChatBubbleMessage variant={variant}>
              <Label htmlFor="text">{message.content.title}</Label>
              <p id="text">{message.content.text}</p>
            </ChatBubbleMessage>
            {message.loading && <LoadingSpinner/>}
            {message.failure && <CircleX/>}
          </ChatBubble>
        })}
      </ChatMessageList>

    </div>
  </>;
}

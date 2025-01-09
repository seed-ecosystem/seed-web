import {ChatBubble, ChatBubbleAvatar, ChatBubbleMessage} from "@/modules/core/components/chat/chat-bubble.tsx";
import {ChatMessageList} from "@/modules/core/components/chat/chat-message-list.tsx";
import * as React from "react";
import {Label} from "@/modules/core/components/label.tsx";
import {LoadingSpinner} from "@/modules/core/components/loading-spinner.tsx";
import {CircleX} from "lucide-react";
import {Message} from "@/modules/main/chat/logic/message.ts";
import {convertTitleToAvatar} from "@/convert-title-to-avatar.ts";
import {memo} from "react";

export const MessagesList = memo((
  {messages}: {
    messages: Message[];
  }
) => (
  <>
    <div className="relative flex-grow h-0 ">
      <div className="flex flex-col-reverse h-full w-full overflow-y-scroll no-scrollbar"
           id="chatMessageListScroll">

        <div className="h-2"/>

        <ChatMessageList
          dataLength={messages.length}
          next={() => {
          }}
          hasMore={false}
          style={{display: 'flex', flexDirection: 'column-reverse'}}>
          {messages.map((message) => {
            if (message.content.type != "regular") return;

            const variant = message.content.author ? 'sent' : 'received';

            const key = `${message.localNonce}`;

            return <ChatBubble variant={variant} key={key}>
              <ChatBubbleAvatar fallback={convertTitleToAvatar(message.content.title)}/>
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

      {/* Smooth gradient effect */}
      <div
        className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
    </div>
  </>
));

import {SiteHeader} from "@/components/messages-list/SiteHeader.tsx";
import {ChatMessage} from "@/components/messages-list/ChatMessage.ts";
import {MessagesList} from "@/components/messages-list/MessagesList.tsx";
import {EmptyMessages} from "@/components/messages-list/EmptyMessages.tsx";
import {MessageInput} from "@/components/messages-list/MessageInput.tsx";

export function MessagesListScreen(
  { messages } : {
    messages: ChatMessage[];
  }
) {
  return (
    <>
      <div className="h-screen w-screen">
        <SiteHeader/>

        <div className="w-full h-full flex justify-center">
          <div className="h-full flex-grow max-w-3xl flex flex-col">
            <div className="h-14"/>

            {messages.length === 0 ? EmptyMessages() : <MessagesList messages={messages}/>}

            <MessageInput/>
          </div>
        </div>
      </div>
    </>
  )
}

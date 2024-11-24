import {SiteHeader} from "@/components/messages-list/SiteHeader.tsx";
import {Message} from "@/usecase/message/message.ts";
import {MessagesList} from "@/components/messages-list/MessagesList.tsx";
import {EmptyMessages} from "@/components/messages-list/EmptyMessages.tsx";
import {MessageInput} from "@/components/messages-list/MessageInput.tsx";

export function MessagesListScreen(
  { messages } : {
    messages: Message[];
  }
) {
  return (
    <>
      <div className="h-screen w-screen overflow-hidden flex flex-col">
        <SiteHeader/>

        <div className="w-full flex-grow flex justify-center">
          <div className="h-full flex-grow max-w-3xl flex flex-col">
            {messages.length === 0 ? EmptyMessages() : <MessagesList messages={messages}/>}

            <MessageInput/>
          </div>
        </div>
      </div>
    </>
  )
}

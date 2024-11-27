import {SiteHeader} from "@/components/chat/SiteHeader.tsx";
import {Message} from "@/usecase/chat/message/message.ts";
import {MessagesList} from "@/components/chat/MessagesList.tsx";
import {EmptyMessages} from "@/components/chat/EmptyMessages.tsx";
import {MessageInput} from "@/components/chat/MessageInput.tsx";
import {useEffect, useState} from "react";
import {ChatDependencies} from "@/components/chat/ChatDependencies.ts";

export function ChatScreen(
  {chat, events, loadMore, sendMessage}: ChatDependencies
) {
  const [messages, setMessages] = useState<Message[]>([]);

  const [hasMore, setHasMore] = useState(true);
  const [text, setText] = useState("");

  useEffect(() => {
    const subscription = events.flow.collect((event) => {
      switch (event.type) {
        case "has_no_more":
          setHasMore(false);
          break;
        case "new":
          setMessages((messages) => [...messages, event.message]);
          console.log()
          break;
      }
    });

    return () => { subscription.cancel(); };
  }, []);

  return (
    <>
      <div className="h-screen w-screen overflow-hidden flex flex-col">
        <SiteHeader/>

        <div className="w-full flex-grow flex justify-center">
          <div className="h-full flex-grow max-w-3xl flex flex-col">
            {
              (messages.length == 0 && !hasMore)
                ? EmptyMessages()
                : <MessagesList
                    messages={messages}
                    hasMore={hasMore}
                    next={loadMore} />
            }

            <MessageInput
              text={text}
              setText={setText}
              onClick={() => sendMessage({ title: "Test", text, ...chat })}/>
          </div>
        </div>
      </div>
    </>
  )
}

import {SiteHeader} from "@/components/chat/SiteHeader.tsx";
import {Message} from "@/usecase/chat/message/message.ts";
import {MessagesList} from "@/components/chat/MessagesList.tsx";
import {EmptyMessages} from "@/components/chat/EmptyMessages.tsx";
import {MessageInput} from "@/components/chat/MessageInput.tsx";
import {useEffect, useState} from "react";
import {createChatDependencies} from "@/components/chat/ChatDependencies.ts";
import {AppDependencies} from "@/components/AppDependencies.ts";
import {Chat} from "@/persistence/chat/chat.ts";

export function ChatScreen(
  {app, chat}: {
    app: AppDependencies,
    chat: Chat
  }
) {
  const {events, loadMore} = createChatDependencies(app, chat);

  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    events.flow.collect((event) => {
      switch (event.type) {
        case "has_no_more":
          setHasMore(false);
          break;
        case "new":
          setMessages([...messages, event.message]);
          break;
      }
    });

    loadMore();
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

            <MessageInput/>
          </div>
        </div>
      </div>
    </>
  )
}

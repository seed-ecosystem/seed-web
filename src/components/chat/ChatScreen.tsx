import {ChatHeader} from "@/components/chat/ChatHeader.tsx";
import {Message} from "@/usecase/chat/message/message.ts";
import {MessagesList} from "@/components/chat/MessagesList.tsx";
import {EmptyMessages} from "@/components/chat/EmptyMessages.tsx";
import {MessageInput} from "@/components/chat/MessageInput.tsx";
import {useEffect, useState} from "react";
import {ChatDependencies} from "@/components/chat/ChatDependencies.ts";
import {LoadingSpinner} from "@/components/ui/loading-spinner.tsx";

export function ChatScreen(
  {events, sendMessage, setNickname, getNickname}: ChatDependencies
) {
  const [messages, setMessages] = useState<Message[]>([]);

  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState("");
  const [nickname, setNicknameState] = useState(getNickname());

  useEffect(() => {
    const subscription = events.flow.collect((event) => {
      switch (event.type) {
        case "loaded":
          setLoaded(true);
          break;
        case "messages_snapshot":
          setMessages(event.messages);
          break;
        case "reset_text":
          setText("");
          break;
        case "nickname":
          setNicknameState(event.nickname)
          break;
      }
    });

    return () => { subscription.cancel(); };
  }, []);

  return (
    <>
      <div className="h-svh w-screen overflow-hidden flex flex-col">
        <div className="w-full flex-grow flex justify-center">
          <div className="h-full flex-grow max-w-full md:max-w-3xl flex flex-col">
            {
              loaded
                ? messages.length == 0
                  ? EmptyMessages()
                  : <MessagesList messages={messages}/>
                : LoadingMessages()
            }

            <MessageInput
              text={text}
              setText={setText}
              onClick={() => sendMessage({ text })}
            />
          </div>
        </div>

        <ChatHeader
          text={nickname}
          setText={setNickname} />

      </div>
    </>
  )
}

function LoadingMessages() {
  return <>
    <div className="w-full h-full flex justify-center items-center"><LoadingSpinner/></div>
  </>;
}

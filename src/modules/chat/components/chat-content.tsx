import {ChatHeader} from "@/modules/chat/components/chat-header.tsx";
import {MessagesList} from "@/modules/chat/components/messages-list.tsx";
import {EmptyMessages} from "@/modules/chat/components/empty-messages.tsx";
import {MessageInput} from "@/modules/chat/components/message-input.tsx";
import {Message} from "@/modules/chat/logic/message.ts";

export function ChatContent(
  {loaded, messages, text, setText, nickname, setNickname, sendMessage}: {
    loaded: boolean;
    messages: Message[];
    text: string;
    setText: (value: string) => void;
    nickname: string;
    setNickname: (value: string) => void;
    sendMessage: () => void;
  }
) {

  return (
    <>
      <div className="h-svh w-screen overflow-hidden flex flex-col">
        <div className="w-full flex-grow flex justify-center">
          <div className="h-full flex-grow max-w-full md:max-w-3xl flex flex-col">
            {
              loaded && messages.length == 0
                ? EmptyMessages()
                : <MessagesList messages={messages} />
            }

            <MessageInput
              text={text}
              setText={setText}
              onClick={() => sendMessage()}
            />
          </div>
        </div>

        <ChatHeader
          text={nickname}
          setText={setNickname}
          loaded={loaded}/>

      </div>
    </>
  )
}

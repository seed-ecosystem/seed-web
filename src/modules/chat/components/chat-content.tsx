import {ChatHeader} from "@/modules/chat/components/chat-header.tsx";
import {MessagesList} from "@/modules/chat/components/messages-list.tsx";
import {EmptyMessages} from "@/modules/chat/components/empty-messages.tsx";
import {MessageInput} from "@/modules/chat/components/message-input.tsx";
import {ChatProps} from "@/modules/chat/components/chat-props.ts";

export function ChatContent(
  {loaded, messages, text, setText, nickname, setNickname, sendMessage}: ChatProps
) {
  return (
    <>
      <div className="h-full w-full overflow-hidden flex flex-col relative">
        <div className="w-full flex-grow flex justify-center">
          <div className="h-full flex-grow max-w-full lg:max-w-3xl flex flex-col">
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

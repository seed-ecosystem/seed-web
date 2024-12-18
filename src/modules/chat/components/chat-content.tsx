import {ChatHeader} from "@/modules/chat/components/chat-header.tsx";
import {MessagesList} from "@/modules/chat/components/messages-list.tsx";
import {EmptyMessages} from "@/modules/chat/components/empty-messages.tsx";
import {MessageInput} from "@/modules/chat/components/message-input.tsx";
import {Message} from "@/modules/chat/logic/message.ts";

export interface ChatProps {
  loading: boolean;
  waiting: boolean;
  messages: Message[];
  text: string;
  setText: (value: string) => void;
  nickname: string;
  setNickname: (value: string) => void;
  sendMessage: () => void;
}

export function ChatContent({loading, waiting, messages, text, setText, nickname, setNickname, sendMessage}: ChatProps) {
  return (
    <>
      <div className="h-full w-full overflow-hidden flex flex-col relative">
        <div className="w-full flex-grow flex justify-center">
          <div className="h-full flex-grow max-w-full lg:max-w-3xl flex flex-col">
            {
              !loading && messages.length == 0
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
          loading={loading}
          waiting={waiting}/>

      </div>
    </>
  )
}

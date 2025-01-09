import {MessagesList} from "@/modules/main/chat/components/messages-list.tsx";
import {EmptyMessages} from "@/modules/main/chat/components/empty-messages.tsx";
import {MessageInput} from "@/modules/main/chat/components/message-input.tsx";
import {Message} from "@/modules/main/chat/logic/message.ts";

export interface ChatProps {
  updating: boolean;
  messages: Message[];
  text: string;
  setText: (value: string) => void;
  sendMessage: () => void;
}

export function ChatContent({updating, messages, text, setText, sendMessage}: ChatProps) {
  return (
    <>
      <div className="h-full w-full overflow-hidden flex flex-col relative">
        <div className="w-full flex-grow flex justify-center">
          <div className="h-full flex-grow max-w-full lg:max-w-3xl flex flex-col">
            {
              !updating && messages.length == 0
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
      </div>
    </>
  )
}

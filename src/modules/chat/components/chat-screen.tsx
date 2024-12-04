import {ChatLogic} from "@/modules/chat/logic/chat-logic.ts";
import {useEffect, useRef, useState} from "react";
import {ChatContent} from "@/modules/chat/components/chat-content.tsx";
import {Message} from "@/modules/chat/logic/message.ts";
import {useEach} from "@/modules/coroutines/channel.ts";

export function ChatScreen(
  {changeNickname, getNickname, sendMessage, chatEvents, loadLocalMessages}: ChatLogic
) {
  const localNonceRef = useRef(0);

  const [messages, setMessages] = useState<Message[]>([]);

  function editMessage(modifiedMessage: Message) {
    setMessages(messages =>
      messages.map(message => message.localNonce == modifiedMessage.localNonce
        ? modifiedMessage
        : message
    ));
  }

  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState("");

  const [nickname, setNicknameState] = useState("");
  const nicknameRef = useRef(nickname);

  function setNickname(value: string) {
    setNicknameState(value);
    nicknameRef.current = value;
  }

  useEach(getNickname, async nickname => setNickname(nickname));

  useEach(() => chatEvents({nicknameRef, localNonceRef}), async event => {
    switch (event.type) {
      case "new":
        setMessages(messages => [...event.messages, ...messages]);
        break;
      case "wait":
        setLoaded(true);
        break;
    }
  });

  useEach(() => loadLocalMessages({nicknameRef, localNonceRef}), async history => {
    setMessages(messages => [...messages, ...history]);
  });

  return ChatContent({
    loaded: loaded,
    messages: messages,
    text: text,
    setText(text) {
      setText(text);
    },
    nickname: nickname,
    setNickname(text) {
      setNickname(text);
      setMessages(messages => changeNickname(text, messages));
    },
    sendMessage() {
      setText("");
      sendMessage(text).onEach(async (event) => {
        switch (event.type) {
          case "sent":
            setMessages(messages => [event.message, ...messages]);
            break;
          case "delivered":
            editMessage(event.message);
            break;
          case "failed":
            editMessage(event.message);
            break;
        }
      });
    }
  })
}

enum Foo {
  Bar
}

const a: number = 10;
const b: Foo = a

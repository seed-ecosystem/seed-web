import {ChatLogic} from "@/modules/chat/logic/chat-logic.ts";
import {useEffect, useState} from "react";
import {ChatContent} from "@/modules/chat/components/chat-content.tsx";
import {Message} from "@/modules/chat/logic/message.ts";

export function ChatScreen(
  {changeNickname, getNickname, sendMessage, chatEvents}: ChatLogic
) {

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
  const [nickname, setNickname] = useState(getNickname());

  useEffect(() => {
    const subscription = chatEvents.collect((event) => {
      switch (event.type) {
        case "new":
          setMessages(messages => [...event.messages, ...messages]);
          break;
        case "wait":
          setLoaded(true);
          break;
      }
    });
    return subscription.cancel;
  }, [chatEvents]);

  ChatContent({
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
      sendMessage(text).collect((event) => {
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

import {ChatLogic} from "@/modules/chat/logic/chat-logic.ts";
import {useEffect, useRef, useState} from "react";
import {ChatContent} from "@/modules/chat/components/chat-content.tsx";
import {Message} from "@/modules/chat/logic/message.ts";
import {useEach} from "@/modules/coroutines/channel.ts";
import {Simulate} from "react-dom/test-utils";
import loadedData = Simulate.loadedData;

export function ChatScreen(
  {changeNickname, getNickname, sendTextMessage, chatEvents, loadLocalMessages}: ChatLogic
) {
  const localNonceRef = useRef(0);
  const serverNonceRef = useRef(0);

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  function editMessage(modifiedMessage: Message) {
    setMessages(messages =>
      messages.map(message => message.localNonce == modifiedMessage.localNonce
        ? modifiedMessage
        : message
    ));
  }

  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState("");

  const [nickname, setNickname] = useState("");
  const nicknameRef = useRef(nickname);

  useEffect(() => {
    nicknameRef.current = nickname.trim().length == 0 ? "Anonymous" : nickname;
  }, [nickname]);


  useEach(getNickname, async nickname => setNickname(nickname));

  useEach(() => chatEvents({nicknameRef, localNonceRef, serverNonceRef}), async event => {
    switch (event.type) {
      case "new":
        console.log("PENIS", event.messages);
        setMessages(messages => [...event.messages, ...messages]);
        break;
      case "wait":
        setLoaded(true);
        break;
      case "close":
        setLoaded(false);
        break;
    }
  });

  useEach(() => loadLocalMessages({nicknameRef, localNonceRef, serverNonceRef}), async history => {
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
      setMessages(messages => changeNickname(nicknameRef.current, messages));
    },
    sendMessage() {
      setText("");
      sendTextMessage({text, localNonceRef, serverNonceRef, nicknameRef}).onEach(async (event) => {
        switch (event.type) {
          case "sending":
            setMessages(messages => [event.message, ...messages]);
            break;
          case "update":
            editMessage(event.message);
            break;
        }
      });
    }
  })
}
import {Message} from "@/modules/chat/logic/message.ts";
import {ChatLogic} from "@/modules/chat/logic/chat-logic.ts";
import {useRef, useState} from "react";
import {useEach} from "@/modules/coroutines/channel.ts";

export interface ChatProps {
  loaded: boolean;
  messages: Message[];
  text: string;
  setText: (value: string) => void;
  nickname: string;
  setNickname: (value: string) => void;
  sendMessage: () => void;
}

export function useChatProps({changeNickname, getNickname, sendTextMessage, chatEvents, loadLocalMessages}: ChatLogic): ChatProps {
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

    const [nickname, setNicknameState] = useState("");
    const nicknameRef = useRef(nickname);

    function setNickname(value: string) {
      setNicknameState(value);
      nicknameRef.current = value.trim().length == 0 ? "Anonymous" : value.trim();
    }

    useEach(getNickname, async nickname => setNickname(nickname));

    useEach(() => chatEvents({nicknameRef, localNonceRef, serverNonceRef}), async event => {
      switch (event.type) {
        case "new":
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

    return {
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
    }
}

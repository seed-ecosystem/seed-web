import {ChatLogic} from "@/modules/main/chat/logic/chat-logic.ts";
import {useEffect, useState} from "react";
import {ChatContent} from "@/modules/main/chat/components/chat-content.tsx";
import {useEach} from "@/coroutines/observable.ts";

export function ChatScreen(
  {
    events,
    getUpdating,
    getMessages,
    getText, setText,
    mount,
    sendMessage
  }: ChatLogic
) {
  const [updating, updateUpdating] = useState(getUpdating);
  const [messages, updateMessages] = useState(getMessages);
  const [text, updateText] = useState(getText);

  useEach(events, event => {
    switch (event.type) {
      case "updating":
        updateUpdating(event.value);
        break;
      case "messages":
        updateMessages(event.value);
        break;
      case "text":
        updateText(event.value);
        break;
    }
  });

  useEffect(mount, [mount])

  return ChatContent({
    updating: updating,
    messages: messages,
    text, setText,
    sendMessage
  });
}

import {ChatLogic} from "@/modules/chat/logic/chat-logic.ts";
import {useEffect, useMemo, useState} from "react";
import {useEach} from "@/modules/coroutines/channel/channel.ts";
import {ChatContent} from "@/modules/chat/components/chat-content.tsx";

export function ChatScreen(
  {
    events,
    getLoading,
    getUpdating,
    getMessages,
    getNickname, setNickname,
    getText, setText, mount,
    sendMessage
  }: ChatLogic
) {
  const [loading, updateLoading] = useState(getLoading());
  const [updating, updateUpdating] = useState(getUpdating());
  const [messages, updateMessages] = useState(getMessages());
  const [nickname, updateNickname] = useState(getNickname());
  const [text, updateText] = useState(getText());

  useEach(events, async event => {
    switch (event.type) {
      case "loading":
        updateLoading(event.value);
        break;
      case "updating":
        updateUpdating(event.value);
        break;
      case "messages":
        updateMessages(event.value);
        break;
      case "nickname":
        updateNickname(event.value);
        break;
      case "text":
        updateText(event.value);
        break;
    }
  });

  useEffect(mount, [mount])

  return ChatContent({
    loading: loading,
    updating: updating,
    messages: messages,
    text, setText,
    nickname, setNickname,
    sendMessage
  });
}

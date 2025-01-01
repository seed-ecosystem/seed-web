import {ChatListTopBarLogic} from "@/modules/chat-list/logic/top-bar/chat-list-top-bar-logic.ts";
import {ChatListTopBarContent} from "@/modules/chat-list/components/top-bar/chat-list-top-bar-content.tsx";
import {ReactElement, useState} from "react";
import {useEach} from "@/coroutines/observable.ts";

export function ChatListTopBar({events, getNickname, setNickname}: ChatListTopBarLogic) {
  const [nickname, updateNickname] = useState(getNickname);

  useEach(events, event => {
    switch (event.type) {
      case "nickname":
        updateNickname(nickname);
        break;
    }
  });

  return ChatListTopBarContent({
    nickname, setNickname
  });
}

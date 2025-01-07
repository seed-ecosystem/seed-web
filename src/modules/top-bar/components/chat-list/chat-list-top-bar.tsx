import {useState} from "react";
import {useEach} from "@/coroutines/observable.ts";
import {ChatListTopBarLogic} from "@/modules/top-bar/logic/chat-list/chat-list-top-bar-logic.ts";
import {ChatListTopBarContent} from "@/modules/top-bar/components/chat-list/chat-list-top-bar-content.tsx";

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

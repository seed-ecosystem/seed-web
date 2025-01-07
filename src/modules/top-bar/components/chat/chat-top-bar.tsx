import {ChatTopBarLogic} from "@/modules/top-bar/logic/chat/chat-top-bar-logic.ts";
import {ChatTopBarContent} from "@/modules/top-bar/components/chat/chat-top-bar-content.tsx";
import {useState} from "react";

export function ChatTopBar({events, getWaiting, getTitle}: ChatTopBarLogic) {
  const [waiting, updateWaiting] = useState(getWaiting);
  const [title] = useState(getTitle);

  events.subscribe(event => {
    switch (event.type) {
      case "waiting":
        updateWaiting(event.value);
        break;
    }
  });

  return ChatTopBarContent({waiting, title});
}

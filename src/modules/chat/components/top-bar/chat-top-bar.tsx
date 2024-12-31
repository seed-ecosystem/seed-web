import {useMemo, useState} from "react";
import {ChatTopBarLogic} from "@/modules/chat/logic/top-bar/chat-top-bar-logic.ts";
import {ChatTopBarContent} from "@/modules/chat/components/top-bar/chat-top-bar-content.tsx";
import {useEach} from "@/coroutines/observable.ts";

export function ChatTopBar({events, getWaiting, getTitle}: ChatTopBarLogic) {
  const [waiting, updateWaiting] = useState(getWaiting);
  const title = useMemo(getTitle, [getTitle]);

  useEach(events, async event => {
    switch (event.type) {
      case "waiting":
        updateWaiting(event.value);
        break;
    }
  });

  return ChatTopBarContent({
    waiting,
    title
  });
}

import {ChatTopBarLogic} from "@/modules/main/top-bar/logic/chat/chat-top-bar-logic.ts";
import {
  ChatTopBarCloseContent,
  ChatTopBarContent,
  ChatTopBarMenuContent
} from "@/modules/main/top-bar/components/chat/chat-top-bar-content.tsx";
import React, {useState} from "react";
import {ChatTopBar} from "@/modules/main/top-bar/components/top-bar-content.tsx";
import {useEach} from "@/coroutines/observable.ts";

export function createChatTopBar({events, getWaiting, getTitle, closeChat, shareChat, deleteChat}: ChatTopBarLogic): ChatTopBar {
  return {
    Close: () => ChatTopBarCloseContent({closeChat}),
    Menu: () => ChatTopBarMenuContent({shareChat, deleteChat}),

    Content(): React.ReactElement {
      const [waiting, updateWaiting] = useState(getWaiting);
      const [title] = useState(getTitle);

      useEach(events, event => {
        switch (event.type) {
          case "waiting":
            updateWaiting(event.value);
            break;
        }
      });

      return ChatTopBarContent({waiting, title});
    }
  };
}

import {ChatTopBarLogic} from "@/modules/top-bar/logic/chat/chat-top-bar-logic.ts";
import {
  ChatTopBarCloseContent,
  ChatTopBarContent,
  ChatTopBarMenuContent
} from "@/modules/top-bar/components/chat/chat-top-bar-content.tsx";
import React, {useState} from "react";
import {ChatTopBar} from "@/modules/top-bar/components/top-bar-content.tsx";

export function createChatTopBar({events, getWaiting, getTitle, closeChat, shareChat}: ChatTopBarLogic): ChatTopBar {
  return {
    Close: () => ChatTopBarCloseContent({closeChat}),
    Menu: () => ChatTopBarMenuContent({shareChat}),

    Content(): React.ReactElement {
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
  };
}

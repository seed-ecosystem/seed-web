import {TopBarLogic} from "@/modules/top-bar/logic/top-bar-logic.ts";
import {ReactElement, useState} from "react";
import {useEach} from "@/coroutines/observable.ts";
import {TopBarContent} from "@/modules/top-bar/components/top-bar-content.tsx";

export function TopBar(
  {events, getLoading, closeChat}: TopBarLogic,
  ChatList: () => ReactElement,
  Chat?: () => ReactElement,
) {
  const [loading, updateLoading] = useState(getLoading);

  useEach(events, event => {
    switch(event.type) {
      case "loading":
        updateLoading(event.value);
        break;
    }
  });

  return TopBarContent({loading, closeChat, ChatList, Chat});
}

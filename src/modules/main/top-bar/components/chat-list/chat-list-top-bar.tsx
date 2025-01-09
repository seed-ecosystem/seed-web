import {useState} from "react";
import {useEach} from "@/coroutines/observable.ts";
import {ChatListTopBarLogic} from "@/modules/main/top-bar/logic/chat-list/chat-list-top-bar-logic.ts";
import {ChatListTopBarContent} from "@/modules/main/top-bar/components/chat-list/chat-list-top-bar-content.tsx";
import {ChatListTopBar} from "@/modules/main/top-bar/components/top-bar-content.tsx";
import {Button} from "@/modules/core/components/button.tsx";
import {Plus} from "lucide-react";

export function createChatListTopBar({events, getNickname, setNickname, showNew}: ChatListTopBarLogic): ChatListTopBar {
  return {
    Content() {
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
    },
    Create() {
      return <Button size="icon" variant="ghost" onClick={showNew}><Plus /></Button>;
    }
  };
}

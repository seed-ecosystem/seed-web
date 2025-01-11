import {ShareChatLogic} from "@/modules/main/share/logic/share-chat-logic.ts";
import {ShareChatContent} from "@/modules/main/share/component/share-chat-content.tsx";
import {useState} from "react";
import {useEach} from "@/coroutines/observable.ts";

export function ShareChat({getShareUrl, events, close}: ShareChatLogic) {
  const [shareUrl, updateShareUrl] = useState(getShareUrl);

  useEach(events, event => {
    switch (event.type) {
      case "shareUrl":
        updateShareUrl(event.value);
        break;
    }
  });

  return <>
    {shareUrl ? <ShareChatContent shareUrl={shareUrl} close={close} /> : undefined}
  </>
}

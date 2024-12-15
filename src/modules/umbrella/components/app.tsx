import {Logic} from "@/modules/umbrella/logic/logic.ts";
import {useEffect, useMemo} from "react";
import {MainScreen} from "@/modules/main/components/main-screen.ts";
import {useRoute} from "wouter";
import {launch} from "@/modules/coroutines/launch.ts";

export function App({logic}: {logic: Logic}) {
  const mainLogic = useMemo(() => logic.createMainLogic(), [logic]);

  const [_, importChat] = useRoute("/import/:title/:chatId/:chatKey/:nonce");

  useEffect(() => launch(async () => {
    if (!importChat) return;
    await logic.persistence.chat.add({
      id: decodeURIComponent(importChat.chatId),
      title: decodeURIComponent(importChat.title),
    })
    await logic.persistence.message.add({
      chatId: decodeURIComponent(importChat.chatId),
      content: {
        type: "deferred"
      },
      key: decodeURIComponent(importChat.chatKey),
      nonce: +decodeURIComponent(importChat.nonce)
    });
  }), [importChat]);

  return <MainScreen {...mainLogic} />;
}

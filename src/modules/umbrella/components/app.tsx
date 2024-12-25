import {Logic} from "@/modules/umbrella/logic/logic.ts";
import {useEffect, useMemo} from "react";
import {MainScreen} from "@/modules/main/components/main-screen.ts";
import {useLocation, useRoute} from "wouter";
import {useEach} from "@/modules/coroutines/channel/channel.ts";

export function App({logic}: {logic: Logic}) {
  const mainLogic = useMemo(() => logic.createMainLogic(), [logic]);

  const [, navigate] = useLocation();
  const [, importChat] = useRoute("/import/:title/:chatId/:chatKey/:nonce");

  useEffect(() => {
    if (!importChat) return;
    logic.importChat({
      id: decodeURIComponent(importChat.chatId),
      title: decodeURIComponent(importChat.title),
      initialKey: decodeURIComponent(importChat.chatKey),
      initialNonce: +decodeURIComponent(importChat.nonce)
    });
  }, [importChat]);

  useEach(logic.events, async event => {
    switch (event.type) {
      case "open":
        navigate(`/chat/${encodeURIComponent(event.chatId)}`)
        break;
    }
  });

  return <MainScreen {...mainLogic} />;
}

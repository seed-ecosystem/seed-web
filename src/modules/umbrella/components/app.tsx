import {Logic} from "@/modules/umbrella/logic/logic.ts";
import React, {useEffect, useMemo} from "react";
import {MainScreen} from "@/modules/main/components/main-screen.tsx";
import {Route, useLocation, useRoute} from "wouter";
import {useEach} from "@/coroutines/observable.ts";
import {CreateChat} from "@/modules/new-chat/component/create-chat.tsx";

export function App({logic}: {logic: Logic}) {
  const main = useMemo(() => logic.createMain(), [logic]);

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

  useEach(logic.events, event => {
    switch (event.type) {
      case "open":
        navigate(`/chat/${encodeURIComponent(event.chatId)}`)
        break;
    }
  });

  return <>
    <MainScreen {...main} />
    <Route path="/create"><CreateChat {...main.createCreateChat()} /></Route>
  </>;
}

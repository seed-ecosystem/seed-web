import { Logic } from "@/modules/umbrella/logic/logic.ts";
import React, { useEffect, useMemo } from "react";
import { MainScreen } from "@/modules/main/components/main-screen.tsx";
import { useLocation, useRoute } from "wouter";
import { useEach } from "@/coroutines/observable.ts";
import { Toaster } from "@/components/ui/toaster.tsx";

export function App({ logic }: { logic: Logic }) {
  const main = useMemo(() => logic.createMain(), [logic]);

  const [, navigate] = useLocation();
  const [, importChat] = useRoute("/import/:title/:chatId/:chatKey/:nonce/:serverUrl");

  useEffect(() => {
    if (!importChat) return;
    logic.importChat({
      id: decodeURIComponent(importChat.chatId),
      title: decodeURIComponent(importChat.title),
      initialKey: decodeURIComponent(importChat.chatKey),
      initialNonce: +decodeURIComponent(importChat.nonce),
      lastMessageDate: new Date(),
      unreadCount: 0,
      serverUrl: decodeURIComponent(importChat.serverUrl),
    });
  }, [importChat, logic]);

  useEach(logic.events, event => {
    switch (event.type) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      case "open":
        navigate(`/chat/${encodeURIComponent(event.chatId)}`);
        break;
    }
  });

  const MemoMainScreen = React.memo(MainScreen);

  return <>
    <MemoMainScreen {...main} />
    <Toaster />
  </>;
}

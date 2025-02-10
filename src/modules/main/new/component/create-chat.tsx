import {CreateChatContent} from "@/modules/main/new/component/create-chat-content.tsx";
import {NewLogic} from "@/modules/main/new/logic/new-logic.ts";
import React, {useState} from "react";
import {useLocation} from "wouter";
import {useEach} from "@/coroutines/observable.ts";
import {BackendSelector} from "@/modules/main/new/select-backend/component/backend-selector.tsx";

export function CreateChat({events, getTitle, setTitle, create, cancel, selector}: NewLogic) {
  const [, navigate] = useLocation();
  const [title, updateTitle] = useState(getTitle);

  useEach(events, event => {
    switch (event.type) {
      case "title":
        updateTitle(event.value);
        break;
      case "openChat":
        navigate(`/chat/${encodeURIComponent(event.chatId)}`);
        break;
    }
  });

  return CreateChatContent({
    title, setTitle,
    create, cancel,
    BackendSelector: () => BackendSelector(selector),
  });
}

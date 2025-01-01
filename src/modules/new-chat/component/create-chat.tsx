import {CreateChatContent} from "@/modules/new-chat/component/create-chat-content.tsx";
import {CreateChatLogic} from "@/modules/new-chat/logic/create-chat-logic.ts";
import {useState} from "react";
import {useLocation} from "wouter";

export function CreateChat({events, getTitle, setTitle, create, cancel}: CreateChatLogic) {
  const [, navigate] = useLocation();
  const [title, updateTitle] = useState(getTitle);

  events.subscribe(event => {
    switch (event.type) {
      case "title":
        updateTitle(event.value);
        break;
      case "close":
        navigate("/");
        break;
      case "open":
        navigate(`/chat/${encodeURIComponent(event.chatId)}`);
        break;
    }
  })

  return CreateChatContent({ title, setTitle, create, cancel });
}

import {ChatLogic} from "@/modules/chat/logic/chat-logic.ts";
import {ChatScreen} from "@/modules/chat/components/chat-screen.tsx";

export function App(
  {chat}: {
    chat: ChatLogic
  }
) {
  return (
    <>
      <ChatScreen {...chat}/>
    </>
  )
}

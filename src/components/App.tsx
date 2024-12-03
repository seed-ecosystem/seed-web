import {AppDependencies} from "@/components/AppDependencies.ts";
import {ChatContent} from "@/modules/chat/components/chat-content.tsx";
import {ChatDependencies} from "@/components/chat/ChatDependencies.ts";

export function App(
  {app, chat}: {
    app: AppDependencies,
    chat: ChatDependencies
  }
) {
  return (
    <>
      <ChatContent {...chat}/>
    </>
  )
}

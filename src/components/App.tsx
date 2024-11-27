import {AppDependencies} from "@/components/AppDependencies.ts";
import {ChatScreen} from "@/components/chat/ChatScreen.tsx";
import {ChatDependencies} from "@/components/chat/ChatDependencies.ts";

export function App(
  {app, chat}: {
    app: AppDependencies,
    chat: ChatDependencies
  }
) {
  return (
    <>
      <ChatScreen {...chat}/>
    </>
  )
}

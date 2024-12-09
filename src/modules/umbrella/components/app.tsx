import {Logic} from "@/modules/umbrella/logic/logic.ts";
import {useMemo} from "react";
import {useMainProps} from "@/modules/main/components/main-props.ts";
import {MainContent} from "@/modules/main/components/main-content.tsx";

export function App({logic}: {logic: Logic}) {
  const chatListLogic = useMemo(() => logic.createChatList(), [logic]);
  const mainProps = useMainProps(chatListLogic);

  return <MainContent {...mainProps} />;
}

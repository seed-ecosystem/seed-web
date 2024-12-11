import {Logic} from "@/modules/umbrella/logic/logic.ts";
import {useMemo} from "react";
import {MainScreen} from "@/modules/main/components/main-screen.ts";

export function App({logic}: {logic: Logic}) {
  const mainLogic = useMemo(() => logic.createMainLogic(), [logic]);

  return <MainScreen {...mainLogic} />;
}

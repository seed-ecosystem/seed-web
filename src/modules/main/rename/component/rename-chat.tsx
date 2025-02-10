import {RenameLogic} from "@/modules/main/rename/logic/rename-logic.ts";
import {useState} from "react";
import {useEach} from "@/coroutines/observable.ts";
import {RenameContent} from "@/modules/main/rename/component/rename-content.tsx";

export function RenameChat(
  {
    events,
    getTitle, setTitle,
    rename, cancel,
  }: RenameLogic,
) {
  const [title, updateTitle] = useState(getTitle);

  useEach(events, event => {
    switch (event.type) {
      case "title":
        updateTitle(event.value);
        break;
    }
  });

  return RenameContent({ title, setTitle, rename, cancel });
}

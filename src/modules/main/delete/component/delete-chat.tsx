import {DeleteLogic} from "@/modules/main/delete/logic/delete-logic.ts";
import {DeleteContent} from "@/modules/main/delete/component/delete-content.tsx";

export function DeleteChat({close, delete: onDelete}: DeleteLogic) {
  return DeleteContent({close, delete: onDelete});
}

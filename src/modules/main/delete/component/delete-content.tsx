import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/modules/core/components/alert-dialog.tsx";
import {useEffect, useRef} from "react";

export type DeleteProps = {
  close(): void;
  delete(): void;
}

export function DeleteContent({close, delete: onDelete}: DeleteProps) {
  const deleteRef = useRef(onDelete);
  deleteRef.current = onDelete;

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        deleteRef.current();
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>If you leave the chat, you may lose it forever</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={close}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/modules/core/components/alert-dialog.tsx";
import {Input} from "@/modules/core/components/input.tsx";
import {useEffect, useRef, useState} from "react";

export type RenameContentProps = {
  title: string;
  setTitle: (value: string) => void;
  rename(): void;
  cancel(): void;
}

export function RenameContent({title, setTitle, rename, cancel}: RenameContentProps) {
  const [titleRef, updateTitleRef] = useState<HTMLInputElement | null>();

  useEffect(() => {
    if (!titleRef) return;
    if (titleRef.value == title) return;
    titleRef.value = title;
  }, [title, titleRef]);

  const renameRef = useRef(rename);
  renameRef.current = rename

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (document.activeElement !== titleRef) return;
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        renameRef.current();
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [titleRef]);

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rename Chat</AlertDialogTitle>
          <AlertDialogDescription>Change chat title. This action is local</AlertDialogDescription>
        </AlertDialogHeader>
        <Input ref={updateTitleRef} enterKeyHint="done" placeholder="Title" onChange={(e) => setTitle(e.target.value)} autoFocus />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={rename}>Rename</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

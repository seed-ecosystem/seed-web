import {
  AlertDialog, AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/modules/core/components/alert-dialog.tsx";
import {Input} from "@/modules/core/components/input.tsx";
import {useEffect, useRef} from "react";

export type CreateChatContentProps = {
  title: string;
  setTitle: (value: string) => void;
  create(): void;
  cancel(): void;
}

export function CreateChatContent({title, setTitle, create, cancel}: CreateChatContentProps) {
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const current = titleRef.current;
    if (!current) return;
    if (current.value == title) return;
    current.value = title;
  }, [title]);

  const createRef = useRef(create);
  createRef.current = create

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (document.activeElement !== titleRef.current) return;
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        createRef.current();
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
          <AlertDialogTitle>New Chat</AlertDialogTitle>
          <AlertDialogDescription>Enter chat title and start chatting right away</AlertDialogDescription>
        </AlertDialogHeader>
        <Input ref={titleRef} enterKeyHint="done" placeholder="Title" onChange={(e) => setTitle(e.target.value)} autoFocus />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={create}>Create</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

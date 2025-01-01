import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/modules/core/components/alert-dialog.tsx"
import {Input} from "@/modules/core/components/input.tsx";
import {Button} from "@/modules/core/components/button.tsx";
import {Plus} from "lucide-react";

export function ImportChat() {
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger>
          <Button size="icon" variant="ghost">
            <Plus/>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a private key to start chatting
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input enterKeyHint="done" placeholder="seed://0x6BEA7BF661BCE377C8F76FBAAB61A"/>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Add</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

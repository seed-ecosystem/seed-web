import {ChatInput} from "@/components/ui/chat/chat-input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CornerDownLeft} from "lucide-react";

export function MessageInput() {
  return <>
    <div
      className="m-10 p-1 relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">

      <ChatInput
        placeholder="Type your message here..."
        className="resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring--1 h-max"/>

      <div className="flex items-center p-3 pt-0">

        <Button
          size="sm"
          className="ml-auto gap-1.5">
          Send Message
          <CornerDownLeft className="size-3.5"/>
        </Button>
      </div>
    </div>
  </>
}

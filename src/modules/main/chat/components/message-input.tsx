import {ChatInput} from "@/modules/core/components/chat/chat-input.tsx";
import {Button} from "@/modules/core/components/button.tsx";
import {CornerDownLeft, Send} from "lucide-react";
import {MutableRefObject, useEffect, useRef} from "react";

export function MessageInput(
  {text, setText, onClick}: {
    text: string;
    setText: (text: string) => void;
    onClick: () => void;
  }
) {
  const desktopRef= useRef<HTMLTextAreaElement>(null);
  const mobileRef= useRef<HTMLTextAreaElement>(null);
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (document.activeElement !== desktopRef.current && document.activeElement !== mobileRef.current) return;
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        if (event.shiftKey) return;
        onClickRef.current();
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  useEffect(() => {
    if (desktopRef.current!.value != text) {
      desktopRef.current!.value = text;
    }
    if (mobileRef.current!.value != text) {
      mobileRef.current!.value = text;
    }
  }, [text]);

  return <>
    <div>
      <div className="flex sm:hidden p-1">
        <ChatInput
          ref={mobileRef}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type your message here..."
          className="flex-grow resize-none rounded-lg bg-background border-0 shadow-none focus-visible:ring--1 h-max"/>

        <Button
          size="icon"
          className="me-2"
          onClick={onClick}>
          <Send/>
        </Button>
      </div>
      <div
        className="hidden sm:block mx-10 mb-7 mt-1 p-1 relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
        <ChatInput
          ref={desktopRef}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type your message here..."
          className="resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring--1 h-max"/>

        <div className="flex items-center p-3 pt-0">

          <Button
            size="sm"
            className="ml-auto gap-1.5"
            onClick={onClick}>
            Send Message
            <CornerDownLeft className="size-3.5"/>
          </Button>
        </div>
      </div>
    </div>
  </>
}

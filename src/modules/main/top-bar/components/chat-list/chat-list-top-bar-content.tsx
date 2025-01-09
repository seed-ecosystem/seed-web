import {useEffect, useRef} from "react";
import {Input} from "@/modules/core/components/input.tsx";

export interface ChatListTopBarProps {
  nickname: string;
  setNickname: (text: string) => void;
}

export function ChatListTopBarContent({nickname, setNickname}: ChatListTopBarProps) {
  return <NicknameInput text={nickname} setText={setNickname}/>;
}

function NicknameInput(
  {text, setText}: {
    text: string;
    setText: (text: string) => void;
  }
) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current!.value != text) {
      inputRef.current!.value = text;
    }
  }, [text]);

  return <div className="w-full h-full flex justify-center items-center">
    <Input
      ref={inputRef}
      onChange={(e) => setText(e.target.value)}
      placeholder={"Anonymous"} />
  </div>;
}

export function ChatListCreateChat() {

}

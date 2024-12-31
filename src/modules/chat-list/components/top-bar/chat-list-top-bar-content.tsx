import {motion} from "framer-motion";
import {useEffect, useRef} from "react";
import {Input} from "@/modules/core/components/input.tsx";

export interface ChatListTopBarProps {
  nickname: string;
  setNickname: (text: string) => void;
}

export function ChatListTopBarContent({nickname, setNickname}: ChatListTopBarProps) {
  return <motion.div className="absolute left-0 right-0 m-auto" key="nickname" initial={{opacity: 0}} animate={{opacity: 1}}>
    <NicknameInput text={nickname} setText={setNickname}/>
  </motion.div>;
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

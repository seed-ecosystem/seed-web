import {ImportChat} from "@/modules/chat/components/import-chat.tsx";
import {motion, AnimatePresence} from "framer-motion";
import {LoadingSpinner} from "@/modules/core/components/loading-spinner.tsx";
import * as React from "react";
import {Input} from "@/modules/core/components/input.tsx";
import {useEffect, useRef} from "react";

export function ChatHeader({text, loading, waiting, setText}: {
  text: string;
  loading: boolean;
  waiting: boolean;
  setText: (text: string) => void;
}) {
  return (
    <div className="flex absolute h-14 w-full border-b border-border/40 bg-background/95 items-center px-4">
      <h1 className="text-2xl font-medium">Seed</h1>
      <div className="flex h-full justify-center items-center flex-1 mx-4 relative">
        <AnimatePresence>
          {loading
            ? <motion.div className="absolute left-0 right-0" key="loader" exit={{y: -10, opacity: 0}}>
              <Connecting/>
            </motion.div>
            : waiting
              ? <motion.div className="absolute left-0 right-0" key="loader" exit={{y: -10, opacity: 0}}>
                <Updating/>
              </motion.div>
              : <motion.div className="absolute left-0 right-0 m-auto" key="nickname" initial={{opacity: 0}} animate={{opacity: 1}}>
                <NicknameInput text={text} setText={setText}/>
              </motion.div>
          }
        </AnimatePresence>
      </div>
      <ImportChat/>
    </div>
  )
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

function Connecting() {
  return <>
      <div className="w-full h-full flex justify-center items-center"><p className="overflow-hidden text-ellipsis">Connecting...</p><LoadingSpinner className="size-4"/></div>
  </>;
}

function Updating() {
  return <>
    <div className="w-full h-full flex justify-center items-center"><p className="overflow-hidden text-ellipsis">Updating...</p><LoadingSpinner className="size-4"/></div>
  </>;
}

import {ImportChat} from "@/components/chat/ImportChat.tsx";
import {NicknameInput} from "@/components/chat/NicknameInput.tsx";

export function ChatHeader({text, setText}: {
  text: string;
  setText: (text: string) => void;
}) {
  return (
    <div className="flex fixed h-14 w-full border-b border-border/40 bg-background/95 items-center px-4">
      <h1 className="text-2xl font-medium">Seed</h1>
      <div className="flex justify-center flex-1 px-4">
        <div>
          <NicknameInput text={text} setText={setText} />
        </div>
      </div>
      <ImportChat/>
    </div>
  )
}

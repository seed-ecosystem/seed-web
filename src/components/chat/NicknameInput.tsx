import {Input} from "@/components/ui/input.tsx";

export function NicknameInput(
  {text, setText}: {
    text: string;
    setText: (text: string) => void;
  }
) {
  return <Input
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder={"Anonymous"}
    />;
}

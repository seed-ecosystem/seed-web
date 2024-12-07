import {createContext, PropsWithChildren, useContext, useState} from "react";

export type ChatContext = {
  nickname: string
  setNickname: (name: string) => void
}

export const chatContext = createContext<ChatContext>({
  nickname: '',
  setNickname: () => {},
})

export function ChatContextProvider({children}: PropsWithChildren) {
  const [nickname, setNickname] = useState<string>('');

  return (
    <chatContext.Provider value={{ nickname, setNickname }}>{children}</chatContext.Provider>
  )
}

export const MyComp =() => {
  const { nickname } = useContext(chatContext);
  return (
    <div>{nickname}</div>
  )
}
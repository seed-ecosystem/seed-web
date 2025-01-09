import {NicknameStateHandle} from "@/modules/main/logic/nickname-state-handle.ts";
import {Message} from "@/modules/main/chat/logic/message.ts";

export type ListenNicknameOptions = {
  nickname: NicknameStateHandle;
  getMessages(): Message[];
  setMessages(messages: Message[]): void;
  setDisplayNickname(value: string): void;
}

export function listenNickname({nickname, getMessages, setMessages, setDisplayNickname}: ListenNicknameOptions) {
  nickname.updates.subscribe(value => {
    const messages = getMessages().map(message => {
      if (message.content.type != "regular") return message;

      const content = message.content;

      if (content.title == value) {
        return {
          ...message,
          content: {
            ...content,
            author: true
          }
        };
      } else if (content.author) {
        return {
          ...message,
          content: {
            ...content,
            author: false
          }
        }
      }

      return message;
    });

    setMessages(messages);
  });

  nickname.displayUpdates.subscribe(setDisplayNickname);
}

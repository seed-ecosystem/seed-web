import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {Message} from "@/modules/chat/logic/message.ts";
import {launch} from "@/modules/coroutines/launch.ts";

export type SetNicknameOptions = {
  value?: string;
  setNickname(value: string): void;
  setDisplayNickname(value: string): void;
  getMessages(): Message[];
  setMessages(messages: Message[]): void;
  persistence: SeedPersistence;
}

export function onNicknameChange(
  {
    value,
    setNickname, setDisplayNickname,
    getMessages, setMessages,
    persistence
  }: SetNicknameOptions
) {
  const nickname = !value || value.trim().length == 0 ? "Anonymous" : value;
  const displayNickname = value?.trim() ?? "";

  setNickname(nickname);
  setDisplayNickname(displayNickname);

  launch(async () => persistence.nickname.setName(displayNickname));

  const messages = getMessages().map(message => {
    if (message.content.type != "regular") return message;

    const content = message.content;

    if (content.title == nickname) {
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
}

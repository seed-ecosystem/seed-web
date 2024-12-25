import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {Message} from "@/modules/chat/logic/message.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {message} from "typia/lib/protobuf";

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
  const nickname = value ?? "Anonymous";
  const displayNickname = value ?? "";

  setNickname(nickname);
  setDisplayNickname(displayNickname);

  launch(async () => persistence.nickname.setName(nickname));

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

import {Message} from "@/modules/chat/logic/message.ts";
import {NicknameStorage} from "@/modules/chat/persistence/nickname-storage.ts";
import {launch} from "@/modules/coroutines/launch.ts";

export interface ChangeNicknameUsecase {
  (nickname: string, messages: Message[]): Message[];
}

export function createChangeNicknameUsecase(
  {nicknameStorage}: {
    nicknameStorage: NicknameStorage;
  }
): ChangeNicknameUsecase {
  return (nickname, messages) => {
    launch(() => nicknameStorage.setName(nickname));
    return messages.map((message) => {
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

      return message
    });
  }
}

import {Message} from "@/modules/chat/logic/message.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {launch} from "@/modules/coroutines/launch.ts";

export type LoadLocalMessagesOptions = {
  chatId: string;
  serverNonce: number;
  setServerNonce(value: number): void;
  localNonce: number;
  setLocalNonce(value: number): void;
  getNickname(): string;
  setMessages(values: Message[]): void;
  persistence: SeedPersistence;
}

export function loadLocalMessages(
  {
    chatId,
    serverNonce, setServerNonce,
    localNonce, setLocalNonce,
    getNickname, setMessages,
    persistence
  }: LoadLocalMessagesOptions
) {
  launch(async () => {
    const persistenceMessages = await persistence.message.list({chatId})
    const result: Message[] = [];

    for (const message of persistenceMessages) {

      if (message.nonce > serverNonce) {
        setServerNonce(message.nonce);
      }

      localNonce++;
      setLocalNonce(localNonce);

      let common = {
        localNonce: localNonce,
        serverNonce: message.nonce,
        loading: false,
        failure: false
      }

      if (message.content.type == "regular") {
        result.push({
          ...common,
          content: {
            ...message.content,
            author: getNickname() == message.content.title
          }
        });
      } else {
        result.push({
          ...common,
          content: { type: "unknown" }
        });
      }
    }

    setMessages(result);
  });
}

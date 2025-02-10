import { Message } from "@/modules/main/chat/logic/message.ts";
import { SeedPersistence } from "@/modules/umbrella/persistence/seed-persistence.ts";
import { launch } from "@/coroutines/launch.ts";
import { NicknameStateHandle } from "@/modules/main/logic/nickname-state-handle.ts";

export type LoadLocalMessagesOptions = {
  url: string;
  queueId: string;
  nickname: NicknameStateHandle;
  serverNonce: number;
  setServerNonce: (value: number) => void;
  localNonce: number;
  setLocalNonce: (value: number) => void;
  setMessages: (values: Message[]) => void;
  setUpdating: () => void;
  persistence: SeedPersistence;
}

export function loadLocalMessages(
  {
    url, queueId, nickname,
    serverNonce, setServerNonce,
    localNonce, setLocalNonce,
    setMessages,
    persistence,
  }: LoadLocalMessagesOptions,
) {
  launch(async () => {
    const persistenceMessages = await persistence.message.list({ url, queueId });
    const result: Message[] = [];

    for (const message of persistenceMessages) {

      if (message.nonce > serverNonce) {
        setServerNonce(message.nonce);
      }

      localNonce++;
      setLocalNonce(localNonce);

      const common = {
        localNonce: localNonce,
        serverNonce: message.nonce,
        loading: false,
        failure: false,
      };

      if (message.content.type == "regular") {
        result.push({
          ...common,
          content: {
            ...message.content,
            author: nickname.get() == message.content.title,
          },
        });
      } else {
        result.push({
          ...common,
          content: { type: "unknown" },
        });
      }
    }

    setMessages(result);
  });
}

import {MessageStorage} from "@/modules/chat/persistence/message-storage.ts";
import {MessageCoder} from "@/modules/crypto/message-coder.ts";

export interface NextMessageUsecase {
  (): Promise<{ nonce: number, key: string }>
}

export function createNextMessageUsecase(
  {messageStorage, messageCoder, chatId}: {
    messageStorage: MessageStorage;
    messageCoder: MessageCoder;
    chatId: string;
  }
): NextMessageUsecase {
  return async () => {
    const lastMessage = await messageStorage.lastMessage({chatId})

    if (!lastMessage) throw new Error("Cannot create next message, because there is no last message");

    if (lastMessage.content.type == "deferred") {
      return { nonce: lastMessage.nonce, key: lastMessage.key };
    } else {
      const nonce = lastMessage.nonce + 1;
      const key = await messageCoder.deriveNextKey(lastMessage.key);
      return {nonce, key};
    }
  };
}

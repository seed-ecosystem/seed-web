import {GetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/get-message-key-usecase.ts";
import {Chat} from "@/persistence/chat/chat.ts";
import {KeyStorage} from "@/persistence/key/key-storage.ts";
import {MessageCoder} from "@/crypto/message-coder.ts";

export function createGetMessageKeyUsecase(
  { keyStorage, coder, chat }: {
    keyStorage: KeyStorage;
    coder: MessageCoder;
    chat: Chat
  },
): GetMessageKeyUsecase {
  return async (nonce) => {
    const cached = await keyStorage.get({ chat, nonce });

    if (cached) {
      return cached;
    }

    const last = await keyStorage.last({ chat });

    if (!last) {
      throw new Error("Cannot get message key for chat that is not created");
    }

    // If cached nonce is AFTER target nonce and IT IS NOT CACHED
    // we cannot go back with keys. Usually this means that message
    // was sent before user has "joined" the chat
    if (last.nonce > nonce) {
      return;
    }

    let key = last.key;
    let keyNonce = last.nonce;
    const messages = [];

    while (keyNonce !== nonce) {
      key = await coder.deriveNextKey(key);
      keyNonce++;
      messages.push({
        chat: chat,
        key: key,
        nonce: keyNonce,
      });
    }

    for (const message of messages) {
      await keyStorage.push(message);
    }

    return key;
  };
}

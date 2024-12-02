import {GetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/get-message-key-usecase.ts";
import {Chat} from "@/deprecated-persistence/chat/chat.ts";
import {MessageCoder} from "@/modules/crypto/message-coder.ts";
import {MessageStorage} from "@/modules/chat/persistence/message-storage.ts";

export function createGetMessageKeyUsecase(
  { messageStorage, coder, chat }: {
    messageStorage: MessageStorage;
    coder: MessageCoder;
    chat: Chat
  },
): GetMessageKeyUsecase {
  return async (nonce) => {
    const last = await messageStorage.lastMessage(chat);

    if (!last) {
      throw new Error("Cannot get message-content key for chat that is not created");
    }

    // If cached nonce is AFTER target nonce and IT IS NOT CACHED
    // we cannot go back with keys. Usually this means that message-content
    // was sent before user has "joined" the chat
    if (last.nonce > nonce) {
      return;
    }

    let key = last.key;
    let keyNonce = last.nonce;
    const messages = [];

    while (keyNonce != nonce) {
      key = await coder.deriveNextKey(key);
      keyNonce++;
      messages.push({
        chat: chat,
        key: key,
        nonce: keyNonce,
      });
    }

    return key;
  };
}

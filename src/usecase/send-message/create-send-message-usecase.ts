import {SendMessageUsecase} from "@/usecase/send-message/send-message-usecase.ts";
import {MessageStorage} from "@/persistence/message/message-storage.ts";
import {MessageCoder} from "@/crypto/message-coder.ts";
import {Message as ApiMessage} from "@/api/message/message.ts";
import {SeedSocket} from "@/api/seed-socket.ts";
import {SendMessageRequest, SendMessageResponse} from "@/api/request/send-message-request.ts";

export function createSendMessageUsecase({ socket, storage, coder }: {
  socket: SeedSocket;
  storage: MessageStorage;
  coder: MessageCoder;
}): SendMessageUsecase {
  return async ({ title, text, chatId }): Promise<void> => {

    // We can generate the same nonce simultaneously with some other user,
    // and that's why we need to repeat our request everytime server returned 'false'
    // in status field
    while (true) {

      // If new user wrote a message, we expect it to appear in the storage and provide
      // new nonce and key
      const previous = await storage.lastMessage({ chatId: chatId });

      if (!previous) {
        return;
      }

      const nonce = previous.nonce + 1;
      const key = await coder.deriveNextKey(previous.key);

      const {content, contentIV, signature} = await coder.encode({
        key: key,
        content: {
          text: text,
          title: title,
        },
      })

      const message: ApiMessage = {
        chatId: chatId,
        content: content,
        contentIV: contentIV,
        nonce: nonce,
        signature: signature,
      };

      const request: SendMessageRequest = {
        type: "send",
        message: message,
      };

      const response: SendMessageResponse = await socket.send(request);

      if (response.status) {
        await storage.add({
          title: title,
          chat: { chatId: chatId },
          text: text,
          key: key,
          nonce: nonce
        });

        break
      }
    }
  }
}

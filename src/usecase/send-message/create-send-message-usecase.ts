import {SendMessageUsecase} from "@/usecase/send-message/send-message-usecase.ts";
import {MessageStorage} from "@/persistence/message/message-storage.ts";
import {MessageCoder} from "@/crypto/message-coder.ts";
import {Message as ApiMessage} from "@/api/message/message.ts";
import {SeedSocket} from "@/api/seed-socket.ts";
import {SendMessageRequest, SendMessageResponse} from "@/api/request/send-message-request.ts";
import {ChatEventsUsecase} from "@/usecase/events-usecase/chat-events-usecase.ts";
import {Message} from "@/usecase/message/message.ts";
import {LocalNonceUsecase} from "@/usecase/nonce/local-nonce-usecase.ts";
import {ChatStorage} from "@/persistence/chat/chat-storage.ts";

export function createSendMessageUsecase({ socket, messageStorage, chatStorage, coder, events, localNonce }: {
  socket: SeedSocket;
  messageStorage: MessageStorage;
  chatStorage: ChatStorage;
  coder: MessageCoder;
  events: ChatEventsUsecase;
  localNonce: LocalNonceUsecase;
}): SendMessageUsecase {

  return async ({ title, text, chatId }): Promise<void> => {
    const message: Message = {
      nonce: {
        local: localNonce.incrementAndGet()
      },
      isAuthor: true,
      isSending: true,
      title: title,
      text: text
    };

    events.emit({
      type: "send",
      message: message
    });

    // We can generate the same nonce simultaneously with some other user,
    // and that's why we need to repeat our request everytime server returned 'false'
    // in status field
    while (true) {

      // If new user wrote a encodedMessage, we expect it to appear in the storage and provide
      // new nonce and key
      const previous = await messageStorage.lastMessage({ chatId: chatId });

      let nonce
      let key

      if (previous) {
        nonce = previous.nonce + 1;
        key = await coder.deriveNextKey(previous.key);
      } else {
        nonce = 0;
        key = await chatStorage.getInitialKey({ chatId: chatId });
      }

      const {content, contentIV, signature} = await coder.encode({
        key: key,
        content: {
          text: text,
          title: title,
        },
      });

      const encodedMessage: ApiMessage = {
        chatId: chatId,
        content: content,
        contentIV: contentIV,
        nonce: nonce,
        signature: signature,
      };

      const request: SendMessageRequest = {
        type: "send",
        message: encodedMessage,
      };

      const response: SendMessageResponse = await socket.send(request);

      if (response.status) {
        await messageStorage.add({
          title: title,
          chat: { chatId: chatId },
          text: text,
          key: key,
          nonce: nonce
        });

        events.emit({
          type: "edit",
          nonce: message.nonce,
          message: {
            ...message,
            isSending: false,
            nonce: { server: nonce },
          }
        });

        break
      }
    }
  }
}

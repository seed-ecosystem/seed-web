import {SendMessageUsecase} from "@/usecase/chat/send-message/send-message-usecase.ts";
import {MessageStorage} from "@/persistence/message/message-storage.ts";
import {MessageCoder} from "@/crypto/message-coder.ts";
import {Message as ApiMessage} from "@/api/message/message.ts";
import {SeedSocket} from "@/api/seed-socket.ts";
import {SendMessageRequest, SendMessageResponse} from "@/api/request/send-message-request.ts";
import {EventsUsecase} from "@/usecase/chat/events-usecase/events-usecase.ts";
import {Message} from "@/usecase/chat/message/message.ts";
import {LocalNonceUsecase} from "@/usecase/chat/nonce/local-nonce-usecase.ts";
import {ChatStorage} from "@/persistence/chat/chat-storage.ts";

export function createSendMessageUsecase({ socket, messageStorage, chatStorage, coder, events, localNonce }: {
  socket: SeedSocket;
  messageStorage: MessageStorage;
  chatStorage: ChatStorage;
  coder: MessageCoder;
  events: EventsUsecase;
  localNonce: LocalNonceUsecase;
}): SendMessageUsecase {

  return async ({ title, text, chatId }): Promise<boolean> => {
    const message: Message = {
      nonce: {
        local: localNonce.incrementAndGet()
      },
      isAuthor: true,
      isSending: true,
      content: {
        title: title,
        text: text
      }
    };

    events.emit({
      type: "new",
      message: message
    });

    let ttl = 20;

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

      const response: SendMessageResponse = await socket.execute(request);

      console.log(response);

      if (response.status) {
        await messageStorage.add({
          chat: { chatId: chatId },
          content: {
            title: title,
            text: text,
          },
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

        return true;
      }

      ttl--;

      if (ttl < 0) {
        return false;
      }
    }
  }
}

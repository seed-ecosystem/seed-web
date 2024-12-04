import {Flow} from "@/modules/coroutines/flow.ts";
import {Message, MessageContent} from "@/modules/chat/logic/message.ts";
import {Channel} from "@/modules/coroutines/channel.ts";
import {SeedSocket} from "@/modules/socket/seed-socket.ts";
import {MessageStorage} from "@/modules/chat/persistence/message-storage.ts";
import {MessageCoder} from "@/modules/crypto/message-coder.ts";

export type SendMessageEvent = {
  type: "sent";
  message: Message;
} | {
  type: "delivered";
  message: Message;
} | {
  type: "failed";
  message: Message;
}

export interface SendMessageUsecase {
  (
    options: {
      content: MessageContent;
    }
  ): void;
}

export function createSendMessageUsecase(
  {
    socket, getMessageKey, coder, events,
    localNonce, sanitizeContent, chat
  }: {
    socket: SeedSocket;
    getMessageKey: MessageStorage;
    coder: MessageCoder;
    localNonce: LocalNonceUsecase;
    sanitizeContent: SanitizeContentUsecase;
    chat: Chat;
  }
): SendMessageUsecase {

  return (options) => launch(async () => {
    const content = sanitizeContent(options.content);
    if (!content) return;

    const message: Message = {
      nonce: {
        local: localNonce.incrementAndGet()
      },
      isAuthor: true,
      isSending: true,
      isFailure: false,
      content: content
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
      const key = await getMessageKey(nonce);
      if (!key) throw new Error("Can't get message-content key");

      const {content, contentIV, signature} = await coder.encode({
        key: key,
        content: message.content,
      });

      const encodedMessage: ApiMessage = {
        ...chat,
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

      if (response.status) {
        const event: Message & { nonce: { server: number } } = {
          ...message,
          isSending: false,
          nonce: { server: nonce },
        };

        events.emit({
          type: "edit",
          nonce: message.nonce,
          message: event
        });

        return;
      }

      ttl--;

      if (ttl < 0) {
        events.emit({
          type: "edit",
          nonce: message.nonce,
          message: {
            ...message,
            isFailure: true,
            isSending: false,
          }
        });
        return;
      }
    }
  })
}

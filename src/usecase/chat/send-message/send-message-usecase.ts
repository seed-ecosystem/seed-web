import {SeedSocket} from "@/api/seed-socket.ts";
import {GetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/get-message-key-usecase.ts";
import {MessageCoder} from "@/crypto/message-coder.ts";
import {EventBus} from "@/usecase/chat/event-bus/event-bus.ts";
import {LocalNonceUsecase} from "@/usecase/chat/nonce/local-nonce-usecase.ts";
import {SanitizeContentUsecase} from "@/usecase/chat/sanitize-content-usecase/sanitize-content-usecase.ts";
import {launch} from "@/coroutines/launch.ts";
import {MessageContent} from "@/crypto/message/content/message-content.ts";
import {Message} from "@/usecase/chat/message/message.ts";
import {Message as ApiMessage} from "@/api/message/message.ts";
import {SendMessageRequest, SendMessageResponse} from "@/api/request/send-message-request.ts";
import {Chat} from "@/persistence/chat/chat.ts";

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
    getMessageKey: GetMessageKeyUsecase;
    coder: MessageCoder;
    events: EventBus;
    localNonce: LocalNonceUsecase;
    sanitizeContent: SanitizeContentUsecase;
    chat: Chat;
  }
): SendMessageUsecase {

  let nonce = 0;

  events.flow.collect((event) => {
    switch (event.type) {
      case "edit":
      case "history":
      case "new":
        if ("server" in event.message.nonce) {
          if (event.message.nonce.server >= nonce) {
            nonce = event.message.nonce.server + 1;
          }
        }
        break;
    }
  });

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
      if (!key) throw new Error("Can't get message key");

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
        events.emit({
          type: "edit",
          nonce: message.nonce,
          message: {
            ...message,
            isSending: false,
            nonce: { server: nonce },
          }
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

import {SeedSocket} from "@/modules/socket/seed-socket.ts";
import {GetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/get-message-key-usecase.ts";
import {MessageCoder} from "@/modules/crypto/message-coder.ts";
import {EventBus} from "@/modules/chat/logic/event-bus.ts";
import {LocalNonceUsecase} from "@/usecase/chat/nonce/local-nonce-usecase.ts";
import {SanitizeContentUsecase} from "@/usecase/chat/sanitize-content-usecase/sanitize-content-usecase.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {MessageContent} from "@/modules/crypto/message-content/message-content.ts";
import {Message} from "@/usecase/chat/message/message.ts";
import {Message as ApiMessage} from "@/modules/socket/message/message.ts";
import {SendMessageRequest, SendMessageResponse} from "@/modules/socket/request/send-message-request.ts";
import {Chat} from "@/deprecated-persistence/chat/chat.ts";

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

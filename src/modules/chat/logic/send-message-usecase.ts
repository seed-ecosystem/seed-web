import {Message, MessageContent} from "@/modules/chat/logic/message.ts";
import {Message as ApiMessage} from "@/modules/client/message.ts";
import {SeedSocket} from "@/modules/socket/seed-socket.ts";
import {MessageCoder} from "@/modules/crypto/message-coder.ts";
import {IncrementLocalNonceUsecase} from "@/modules/chat/logic/increment-local-nonce-usecase.ts";
import {SanitizeContentUsecase} from "@/modules/chat/logic/sanitize-content-usecase.ts";
import {MutableRefObject} from "react";
import {launch} from "@/modules/coroutines/launch.ts";
import {NextMessageUsecase} from "@/modules/chat/logic/next-message-usecase.ts";
import {SendMessageRequest, SendMessageResponse} from "@/modules/client/request/send-message-request.ts";
import {Channel} from "@/modules/coroutines/channel/channel.ts";
import {createChannel} from "@/modules/coroutines/channel/create.ts";

export type SendMessageEvent = {
  type: "sending";
  message: Message;
} | {
  type: "update";
  message: Message;
}

export interface SendMessageUsecase {
  (
    options: {
      content: MessageContent;
      localNonceRef: MutableRefObject<number>;
      serverNonceRef: MutableRefObject<number>;
    }
  ): Channel<SendMessageEvent>;
}

export function createSendMessageUsecase(
  {
    socket, messageCoder,
    incrementLocalNonce, nextMessage,
    sanitizeContent, chatId
  }: {
    socket: SeedSocket;
    messageCoder: MessageCoder;
    incrementLocalNonce: IncrementLocalNonceUsecase;
    nextMessage: NextMessageUsecase;
    sanitizeContent: SanitizeContentUsecase;
    chatId: string;
  }
): SendMessageUsecase {
  return ({content, localNonceRef, serverNonceRef}) => {
    const channel = createChannel<SendMessageEvent>();

    launch(async () => {
      content = sanitizeContent(content);

      const message: Message = {
        localNonce: incrementLocalNonce({localNonceRef}),
        serverNonce: null,
        loading: true,
        failure: false,
        content: content
      };

      channel.send({
        type: "sending",
        message: message,
      });

      let ttl = 20;

      // We can generate the same nonce simultaneously with some other user,
      // and that's why we need to repeat our request everytime server returned 'false'
      // in status field
      while (channel.isActive) {
        const {nonce, key} = await nextMessage();

        const {content, contentIV, signature} = await messageCoder.encode({
          key: key,
          content: message.content,
        });

        const encodedMessage: ApiMessage = {
          chatId, content,
          contentIV, nonce,
          signature,
        };

        const request: SendMessageRequest = {
          type: "send",
          message: encodedMessage,
        };

        const response: SendMessageResponse = await socket.execute(request);

        if (response.status) {
          serverNonceRef.current = nonce;

          channel.send({
            type: "update",
            message: {
              ...message,
              serverNonce: nonce,
              loading: false,
            }
          });

          return;
        }

        ttl--;

        if (ttl < 0) {
          channel.send({
            type: "update",
            message: {
              ...message,
              failure: true,
              loading: false,
            }
          });
          return;
        }
      }
    });

    return channel;
  };
}

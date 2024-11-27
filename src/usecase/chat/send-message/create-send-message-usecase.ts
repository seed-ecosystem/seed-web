import {SendMessageUsecase} from "@/usecase/chat/send-message/send-message-usecase.ts";
import {MessageStorage} from "@/persistence/message/message-storage.ts";
import {MessageCoder} from "@/crypto/message-coder.ts";
import {Message as ApiMessage} from "@/api/message/message.ts";
import {SeedSocket} from "@/api/seed-socket.ts";
import {SendMessageRequest, SendMessageResponse} from "@/api/request/send-message-request.ts";
import {EventBus} from "@/usecase/chat/event-bus/event-bus.ts";
import {Message} from "@/usecase/chat/message/message.ts";
import {LocalNonceUsecase} from "@/usecase/chat/nonce/local-nonce-usecase.ts";
import {ChatStorage} from "@/persistence/chat/chat-storage.ts";
import {GetMessageKeyUsecase} from "@/usecase/chat/get-message-key-usecase/get-message-key-usecase.ts";
import {GetNicknameUsecase} from "@/usecase/chat/nickname/get-nickname-usecase.ts";

export function createSendMessageUsecase({ socket, getMessageKey, coder, events, localNonce, nickname }: {
  socket: SeedSocket;
  getMessageKey: GetMessageKeyUsecase;
  coder: MessageCoder;
  events: EventBus;
  localNonce: LocalNonceUsecase;
  nickname: GetNicknameUsecase;
}): SendMessageUsecase {

  let nonce = 0;

  events.flow.collect((event) => {
    switch (event.type) {
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

  return async ({ text, chatId }) => {
    events.emit({ type: "reset_text" });

    const message: Message = {
      nonce: {
        local: localNonce.incrementAndGet()
      },
      isAuthor: true,
      isSending: true,
      content: {
        title: nickname(),
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
      const key = await getMessageKey(nonce);
      if (!key) throw new Error("Can't get message key");

      const {content, contentIV, signature} = await coder.encode({
        key: key,
        content: message.content,
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

        return true;
      }

      ttl--;

      if (ttl < 0) {
        return false;
      }
    }
  }
}

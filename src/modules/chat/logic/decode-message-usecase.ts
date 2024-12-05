import {Message as ApiMessage} from "@/modules/socket/message/message.ts";
import {Message, MessageContent} from "@/modules/chat/logic/message.ts";
import {MessageStorage} from "@/modules/chat/persistence/message-storage.ts";
import {MessageCoder} from "@/modules/crypto/message-coder.ts";
import {IncrementLocalNonceUsecase} from "@/modules/chat/logic/increment-local-nonce-usecase.ts";
import {createChannel} from "@/modules/coroutines/channel.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {MutableRefObject, RefObject} from "react";
import {SanitizeContentUsecase} from "@/modules/chat/logic/sanitize-content-usecase.ts";
import {NextMessageUsecase} from "@/modules/chat/logic/next-message-usecase.ts";

export interface DecodeMessageUsecase {
  (options: {message: ApiMessage, nicknameRef: RefObject<string>, localNonceRef: MutableRefObject<number>}): Promise<Message | undefined>
}

interface DecodeRequest {
  message: ApiMessage;
  nicknameRef: RefObject<string>;
  localNonceRef: MutableRefObject<number>;
  resolve: (message: Message | undefined) => void;
  reject: (reason: any) => void;
}

export function createDecodeMessageUsecase(
  {messageStorage, messageCoder, chatId, incrementLocalNonce, sanitizeContent, nextMessage}: {
    messageStorage: MessageStorage;
    messageCoder: MessageCoder;
    chatId: string;
    incrementLocalNonce: IncrementLocalNonceUsecase;
    sanitizeContent: SanitizeContentUsecase;
    nextMessage: NextMessageUsecase;
  }
): DecodeMessageUsecase {
  const channel = createChannel<DecodeRequest>();

  launch(async () => {
    for await (const {message, nicknameRef, localNonceRef, resolve, reject} of channel) {
      try {
        const lastMessage = await messageStorage.lastMessage({chatId});
        const {nonce: expectedNonce, key: messageKey} = await nextMessage();

        if (!lastMessage) {
          resolve(undefined);
          continue;
        }
        if (expectedNonce != message.nonce) {
          resolve(undefined);
          continue;
        }

        let decoded = await messageCoder.decode({...message, key: messageKey});

        let content: MessageContent;

        switch (decoded?.type) {
          case "regular":
            content = {
              ...decoded,
              author: nicknameRef.current == decoded.title
            };
            break;
          default:
            content = {type: "unknown"};
            break;
        }

        content = sanitizeContent(content);

        await messageStorage.add({
          chatId: chatId,
          content: content,
          key: messageKey,
          nonce: message.nonce
        });

        const nonce = incrementLocalNonce({localNonceRef});

        resolve({
          localNonce: nonce,
          serverNonce: message.nonce,
          content: content,
          loading: false,
          failure: false
        });
      } catch (error) {
        console.log("ERR", error);
        reject(error);
      }
    }
  });

  return async ({message, nicknameRef, localNonceRef}) => new Promise((resolve, reject) => {
    channel.send({
      message, nicknameRef, localNonceRef,
      resolve, reject
    });
  });
}

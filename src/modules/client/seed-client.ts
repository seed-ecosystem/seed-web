import {SeedSocket} from "@/modules/socket/seed-socket.ts";
import {Message} from "@/modules/client/message.ts";
import {SendMessageRequest} from "@/modules/client/request/send-message-request.ts";
import {SubscribeRequest} from "@/modules/client/request/subscribe-request.ts";
import {ChatStorage} from "@/modules/chat-list/persistence/chat-storage.ts";
import {NextMessageUsecase} from "@/modules/chat/logic/next-message-usecase.ts";
import {launch} from "@/modules/coroutines/launch.ts";

export interface SeedClient {
  isConnected: boolean;

  isWaiting(options: {chatId: string}): boolean;

  sendMessage(options: {message: Message}): Promise<void>;
  subscribe(options: {chatId: string, nonce: number}): Promise<void>;
}

export function createSeedClient(
  {socket, chatStorage, createNextMessage}: {
    socket: SeedSocket;
    chatStorage: ChatStorage;
    createNextMessage: (chatId: string) => NextMessageUsecase;
  }
): SeedClient {
  let isWaiting: Record<string, boolean | undefined> = {};
  let isConnected = false;

  bindSubscriptions({socket, chatStorage, createNextMessage});

  socket.events.collect((event) => {
    switch (event.type) {
      case "open":
        isConnected = true;
        break;
      case "close":
        isConnected = false;
        isWaiting = {};
        break;
      case "wait":
        isWaiting[event.chatId] = true;
        break;
    }
  });

  return {
    get isConnected() {
      return isConnected;
    },

    isWaiting({chatId}) {
      return isWaiting[chatId] ?? false;
    },

    async sendMessage({message}): Promise<void> {
      let request: SendMessageRequest = {
        type: "send",
        message: message
      };
      return socket.execute(request);
    },

    async subscribe({chatId, nonce}): Promise<void> {
      let request: SubscribeRequest = {
        type: "subscribe",
        chatId: chatId,
        nonce: nonce
      };
      return socket.execute(request);
    },
  };
}

function bindSubscriptions(
  {socket, chatStorage, createNextMessage}: {
    socket: SeedSocket;
    chatStorage: ChatStorage;
    createNextMessage: (chatId: string) => NextMessageUsecase;
  }
) {
  launch(async () => {
    for (const chat of await chatStorage.list()) {
      const nextMessage = createNextMessage(chat.id);

      socket.bind({
        type: "subscribe",
        async prepare() {
          const {nonce} = await nextMessage();
          return {chatId: chat.id, nonce} as SubscribeRequest;
        }
      });
    }
  });
}

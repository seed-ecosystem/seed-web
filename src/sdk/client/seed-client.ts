import {SeedSocket} from "@/sdk/socket/seed-socket.ts";
import {EncryptedMessage} from "@/sdk/client/encrypted-message.ts";
import {SendMessageRequest} from "@/sdk/client/send-message-request.ts";
import {SubscribeRequest} from "@/sdk/client/subscribe-request.ts";
import {ChatStorage} from "@/modules/chat-list/persistence/chat-storage.ts";
import {NextMessageUsecase} from "@/modules/chat/logic/next-message-usecase.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {ClientEvent, RemoteClientEvent} from "@/sdk/client/client-event.ts";
import typia from "typia";
import {createObservable, Observable} from "@/observable/observable.ts";

// todo:
//  - move all decoding to the client
//  - add work with storage on global level and not on chat screen
export interface SeedClient {
  isConnected: boolean;

  events: Observable<ClientEvent>

  isWaiting(options: {chatId: string}): boolean;

  sendMessage(options: {message: EncryptedMessage}): Promise<void>;
  subscribe(options: {chatId: string, nonce: number}): Promise<void>;
}

export function createSeedClient(
  {socket}: { socket: SeedSocket }
): SeedClient {
  const events = createObservable<ClientEvent>();

  let isWaiting: Record<string, boolean | undefined> = {};
  let isConnected = false;

  socket.remoteEvents.subscribe((event) => {
    if (!typia.is<RemoteClientEvent>(event)) return;
    switch (event.type) {
      case "wait":
        isWaiting[event.chatId] = true;
        events.emit({type: "is_waiting", chatId: event.chatId, isWaiting: true});
        break;
    }
  });

  socket.localEvents.subscribe((event) => {
    switch (event.type) {
      case "open":
        isConnected = true;
        events.emit({type: "is_connected", isConnected: true});
        break;
      case "close":
        isConnected = false;
        events.emit({type: "is_connected", isConnected: false});
        for (const chatId of Object.keys(isWaiting)) {
          events.emit({type: "is_waiting", chatId, isWaiting: false });
        }
        isWaiting = {};
        break;
    }
  });

  return {
    events,

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

import {SeedSocket} from "@/sdk/socket/seed-socket.ts";
import {EncryptedMessage} from "@/sdk/client/encrypted-message.ts";
import {SendMessageRequest, SendMessageResponse} from "@/sdk/client/send-message-request.ts";
import {SubscribeRequest} from "@/sdk/client/subscribe-request.ts";
import {ClientEvent} from "@/sdk/client/client-event.ts";
import typia from "typia";
import {createObservable, Observable} from "@/coroutines/observable.ts";

export interface SendMessageOptions {
  message: EncryptedMessage;
}

export interface SubscribeOptions {
  chatId: string;
  nonce: number;
}

export interface SeedClient {
  events: Observable<ClientEvent>

  isConnected(): boolean;

  sendMessage(options: SendMessageOptions): Promise<boolean>;
  subscribe(options: SubscribeOptions): Promise<void>;
}

export function createSeedClient(
  {socket}: { socket: SeedSocket }
): SeedClient {
  const events = createObservable<ClientEvent>();

  socket.events.subscribe((event) => {
    switch (event.type) {
      case "connected":
        events.emit(event);
        break;
      case "server":
        if (!typia.is<ClientEvent>(event.value)) break;
        events.emit(event.value);
        break;
    }
  });

  return {
    events,

    isConnected() {
      return socket.isConnected();
    },

    async sendMessage({message}): Promise<boolean> {
      let request: SendMessageRequest = {
        type: "send",
        message: message
      };
      const response: SendMessageResponse = await socket.execute(request);
      return response.status;
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

import { Cancellation } from "@/coroutines/cancellation";
import { createObservable, Observable } from "@/coroutines/observable";
import { launch } from "@/coroutines/launch";
import { randomAESKey, randomRSA4096KeyPair } from "@/crypto/subtle";

export type ShareChatEvent = {
  type: "shareUrl";
  value: string;
}

export interface ShareChatLogic {
  events: Observable<ShareChatEvent>;

  getShareUrl: () => string | undefined;

  mount(): Cancellation;

  close(): void;
}

export interface CreateShareChatLogicOptions {

}

export function createShareChatLogic(): ShareChatLogic {
  const events: Observable<ShareChatEvent> = createObservable();

  let shareUrl: string | undefined;

  function setShareUrl(value: string) {
    shareUrl = value;
    events.emit({ type: "shareUrl", value });
  }

  return {
    events,

    getShareUrl: () => shareUrl,

    mount() {
      launch(async () => {
        const queueId = await randomAESKey();
        const { publicKey, privateKey } = await randomRSA4096KeyPair();
        setShareUrl(`seed://share/serverUrl/${queueId}/${publicKey}`);
      });

      return () => {

      };
    },

    close: () => {

    },
  };
}


import {createObservable, Observable} from "@/coroutines/observable.ts";
import {ShareStateHandle} from "@/modules/main/logic/share-state-handle.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {SeedPersistence} from "@/worker/persistence/seed-persistence.ts";
import {deriveNextKey} from "@/sdk/crypto/derive-next-key.ts";

export type ShareChatEvent = {
  type: "shareUrl";
  value: string;
}

export interface ShareChatLogic {
  events: Observable<ShareChatEvent>;

  getShareUrl(): string | undefined;

  close(): void;
}

export function createShareChatLogic(
  {shareStateHandle, persistence, chatId}: {
    shareStateHandle: ShareStateHandle;
    persistence: SeedPersistence;
    chatId: string;
  }): ShareChatLogic {
  const events: Observable<ShareChatEvent> = createObservable();

  let shareUrl: string | undefined;

  function setShareUrl(value: string) {
    shareUrl = value;
    events.emit({ type: "shareUrl", value });
  }

  launch(async () => {
    const {title, initialNonce, initialKey} = (await persistence.chat.get(chatId))!;
    const lastKey = await persistence.key.lastKey({chatId});

    let nonce, key;
    if (lastKey) {
      nonce = lastKey.nonce + 1;
      key = await deriveNextKey({key: lastKey.key});
    } else {
      nonce = initialNonce;
      key = initialKey;
    }

    const origin = window.location.origin;
    const baseUrl = import.meta.env.BASE_URL;

    setShareUrl(`${origin}${baseUrl}#/import/${encodeURIComponent(title)}/${encodeURIComponent(chatId)}/${encodeURIComponent(key)}/${nonce}`);
  });

  return {
    events,

    getShareUrl: () => shareUrl,

    close: () => shareStateHandle.set({ shown: false }),
  };
}

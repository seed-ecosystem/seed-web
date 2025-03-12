import { createObservable, Observable } from "@/coroutines/observable.ts";
import { ShareStateHandle } from "@/modules/main/logic/share-state-handle.ts";
import { launch } from "@/coroutines/launch.ts";
import { SeedPersistence } from "@/modules/umbrella/persistence/seed-persistence.ts";
import { deriveNextKey } from "@/sdk-v2/seed-crypto";

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
  { shareStateHandle, persistence, chatId }: {
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
    const chat = await persistence.chat.get(chatId);
    if (!chat) throw new Error("Share chat not found");
    const { title, initialNonce, initialKey, serverUrl } = chat;

    const lastKey = await persistence.key.lastKey({ chatId });

    let nonce, key;
    if (lastKey) {
      nonce = lastKey.nonce + 1;
      key = await deriveNextKey({ key: lastKey.key });
    } else {
      nonce = initialNonce;
      key = initialKey;
    }

    const origin = window.location.origin;
    const baseUrl = import.meta.env.BASE_URL;

    setShareUrl(`${origin}${baseUrl}#/import/${encodeURIComponent(title)}/${encodeURIComponent(chatId)}/${encodeURIComponent(key)}/${nonce.toString()}/${encodeURIComponent(serverUrl)}`);
  });

  return {
    events,

    getShareUrl: () => shareUrl,

    close: () => { shareStateHandle.set({ shown: false }); },
  };
}

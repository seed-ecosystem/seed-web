import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {Chat} from "@/modules/main/chat-list/logic/chat.ts";
import {loadLocalChats} from "@/modules/main/chat-list/logic/load-local-chats.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {updateLastMessage} from "@/modules/main/chat-list/logic/update-last-message.ts";
import {Cancellation} from "@/coroutines/cancellation.ts";

export type ChatListEvent = {
  type: "chats";
  value: Chat[];
}

export interface ChatListLogic {
  events: Observable<ChatListEvent>;

  getChats(): Chat[];

  mount(): Cancellation;
}

export function createChatListLogic(
  {persistence, worker}: {
    persistence: SeedPersistence;
    worker: WorkerStateHandle;
  }
): ChatListLogic {
  const events = createObservable<ChatListEvent>();

  let chats: Chat[] = [];

  function setChats(value: Chat[]) {
    chats = value;
    events.emit({ type: "chats", value: chats });
  }

  loadLocalChats({persistence}).then(setChats);

  return {
    events,
    getChats: () => chats,
    mount(): Cancellation {
      let cancelUpdateLastMessage = updateLastMessage({persistence, worker});
      return () => {
        cancelUpdateLastMessage();
      }
    }
  };
}

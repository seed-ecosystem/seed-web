import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {UiChat} from "@/modules/main/chat-list/logic/chat.ts";
import {loadLocalChats} from "@/modules/main/chat-list/logic/load-local-chats.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {updateLastMessage} from "@/modules/main/chat-list/logic/update-last-message.ts";
import {Cancellation} from "@/coroutines/cancellation.ts";
import {ChatListStateHandle} from "@/modules/main/chat-list/logic/chat-list-state-handle.ts";

export type ChatListEvent = {
  type: "chats";
  value: UiChat[];
}

export interface ChatListLogic {
  events: Observable<ChatListEvent>;

  getChats(): UiChat[];

  mount(): Cancellation;
}

export function createChatListLogic(
  {persistence, worker, chatListStateHandle}: {
    persistence: SeedPersistence;
    worker: WorkerStateHandle;
    chatListStateHandle: ChatListStateHandle;
  },
): ChatListLogic {
  const events: Observable<ChatListEvent> = createObservable();

  loadLocalChats({persistence}).then(chatListStateHandle.init);

  return {
    events,
    getChats: chatListStateHandle.get,
    mount(): Cancellation {
      const cancel1 = updateLastMessage({worker, chatListStateHandle});
      const cancel2 = chatListStateHandle.updates.subscribe(value => { events.emit({ type: "chats", value }); });

      return () => {
        cancel1();
        cancel2();
      };
    },
  };
}

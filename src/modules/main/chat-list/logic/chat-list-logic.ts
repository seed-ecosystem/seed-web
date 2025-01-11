import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {Chat} from "@/modules/main/chat-list/logic/chat.ts";
import {loadLocalChats} from "@/modules/main/chat-list/logic/load-local-chats.ts";
import {createObservable, Observable} from "@/coroutines/observable.ts";
import {WorkerStateHandle} from "@/modules/umbrella/logic/worker-state-handle.ts";
import {updateLastMessage} from "@/modules/main/chat-list/logic/update-last-message.ts";
import {Cancellation} from "@/coroutines/cancellation.ts";
import {ChatListStateHandle, createChatListStateHandle} from "@/modules/main/chat-list/logic/chat-list-state-handle.ts";

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
  {persistence, worker, chatListStateHandle}: {
    persistence: SeedPersistence;
    worker: WorkerStateHandle;
    chatListStateHandle: ChatListStateHandle;
  }
): ChatListLogic {
  const events: Observable<ChatListEvent> = createObservable();

  loadLocalChats({persistence}).then(chatListStateHandle.set);

  return {
    events,
    getChats: chatListStateHandle.get,
    mount(): Cancellation {
      let cancel1 = updateLastMessage({persistence, worker, chatListStateHandle});
      let cancel2 = chatListStateHandle.updates.subscribe(value => events.emit({ type: "chats", value }));

      return () => {
        cancel1();
        cancel2();
      }
    }
  };
}

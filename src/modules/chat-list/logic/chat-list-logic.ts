import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {Chat} from "@/modules/chat-list/logic/chat.ts";
import {Channel} from "@/modules/coroutines/channel/channel.ts";
import {createChannel} from "@/modules/coroutines/channel/create.ts";
import {loadLocalChats} from "@/modules/chat-list/logic/load-local-chats.ts";

export type ChatListEvent = {
  type: "chats";
  value: Chat[];
}

export interface ChatListLogic {
  events: Channel<ChatListEvent>;

  getChats(): Chat[];
}

export function createChatListLogic(
  {persistence}: {
    persistence: SeedPersistence;
  }
): ChatListLogic {
  const events = createChannel<ChatListEvent>();

  let chats: Chat[] = [];

  function setChats(value: Chat[]) {
    chats = value;
    events.send({ type: "chats", value: chats });
  }

  loadLocalChats({persistence}).then(setChats);

  return {
    events,
    getChats(): Chat[] {
      return chats;
    }
  };
}

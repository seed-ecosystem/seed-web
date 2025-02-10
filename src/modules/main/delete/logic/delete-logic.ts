import {DeleteStateHandle} from "@/modules/main/logic/delete-state-handle.ts";
import {ChatListStateHandle} from "@/modules/main/chat-list/logic/chat-list-state-handle.ts";
import {ChatStateHandle} from "@/modules/main/logic/chat-state-handle.ts";

export interface DeleteLogic {
  close(): void;
  delete(): void;
}

export function createDeleteLogic(
  {deleteStateHandle, chatListStateHandle, chatStateHandle, chatId}: {
    deleteStateHandle: DeleteStateHandle;
    chatListStateHandle: ChatListStateHandle;
    chatStateHandle: ChatStateHandle;
    chatId: string;
  }): DeleteLogic {
  return {
    close: () => { deleteStateHandle.set({ shown: false }); },
    delete: () => {
      chatListStateHandle.delete(chatId);
      deleteStateHandle.set({ shown: false });
      chatStateHandle.set(undefined);
    },
  };
}

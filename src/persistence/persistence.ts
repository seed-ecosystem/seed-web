import {ChatStorage} from "@/persistence/chat/chat-storage.ts";
import {MessageStorage} from "@/persistence/message/message-storage.ts";
import {KeyStorage} from "@/persistence/key/key-storage.ts";
import {NicknameStorage} from "@/persistence/nickname/nickname-storage.ts";

export interface Persistence {
  chat: ChatStorage;
  message: MessageStorage;
  key: KeyStorage;
  nickname: NicknameStorage;
}

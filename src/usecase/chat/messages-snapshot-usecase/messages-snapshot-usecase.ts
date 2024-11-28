import {Message} from "@/usecase/chat/message/message.ts";

export interface MessagesSnapshotUsecase {
  (): Message[];
}

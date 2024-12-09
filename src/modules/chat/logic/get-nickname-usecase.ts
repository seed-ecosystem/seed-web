import {NicknameStorage} from "@/modules/chat/persistence/nickname-storage.ts";
import {Channel, createChannel} from "@/modules/coroutines/channel.ts";

export interface GetNicknameUsecase {
  (): Channel<string>;
}

export function createGetNicknameUsecase(
  {nicknameStorage}: {
    nicknameStorage: NicknameStorage,
  }
): GetNicknameUsecase {
  return () => {
    const channel = createChannel<string>();
    nicknameStorage.getName().then(name => {
      channel.send(name ?? "");
    });
    return channel;
  };
}

import {NicknameStorage} from "@/modules/chat/persistence/nickname-storage.ts";
import {Channel} from "@/modules/coroutines/channel/channel.ts";
import {createChannel} from "@/modules/coroutines/channel/create.ts";

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

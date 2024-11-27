import {GetNicknameUsecase} from "@/usecase/chat/nickname/get-nickname-usecase.ts";
import {EventBus} from "@/usecase/chat/event-bus/event-bus.ts";
import {NicknameStorage} from "@/persistence/nickname/nickname-storage.ts";
import {launch} from "@/coroutines/launch.ts";

export function createGetNicknameUsecase(
  {events, storage}: {
    events: EventBus,
    storage: NicknameStorage,
  }
): GetNicknameUsecase {
  let nickname = "Anonymous";

  launch(async () => {
    const nickname = await storage.getName();
    if (!nickname) return
    events.emit({
      type: "nickname",
      nickname: nickname,
    });
  });

  events.flow.collect((event) => {
    switch (event.type) {
      case "nickname":
        nickname = event.nickname;
        break;
    }
  });

  return () => {
    return nickname;
  };
}

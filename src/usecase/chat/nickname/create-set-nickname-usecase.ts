import {SetNicknameUsecase} from "@/usecase/chat/nickname/set-nickname-usecase.ts";
import {EventBus} from "@/modules/chat/logic/event-bus.ts";
import {NicknameStorage} from "@/modules/chat/persistence/nickname-storage.ts";
import {launch} from "@/modules/coroutines/launch.ts";

export function createSetNicknameUsecase(
  {events, storage}: {
    events: EventBus,
    storage: NicknameStorage,
  }
): SetNicknameUsecase {
  return (value) => {
    events.emit({
      type: "nickname",
      nickname: value
    })
    
    if (value.length == 0) {
      value = "Anonymous";
    }

    launch(() => storage.setName(value));
  };
}

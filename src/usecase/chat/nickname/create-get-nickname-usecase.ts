import {GetNicknameUsecase} from "@/usecase/chat/nickname/get-nickname-usecase.ts";
import {EventBus} from "@/modules/chat/logic/event-bus.ts";
import {NicknameStorage} from "@/modules/chat/persistence/nickname-storage.ts";
import {launch} from "@/modules/coroutines/launch.ts";
import {MessagesSnapshotUsecase} from "@/usecase/chat/messages-snapshot-usecase/messages-snapshot-usecase.ts";

export function createGetNicknameUsecase(
  {events, storage, messagesSnapshot}: {
    events: EventBus,
    storage: NicknameStorage,
    messagesSnapshot: MessagesSnapshotUsecase
  }
): GetNicknameUsecase {
  let nickname: string;

  function setName(string?: string) {
    nickname = string || "Anonymous";
  }

  setName();

  launch(async () => {
    const storageName = await storage.getName();

    setName(storageName);

    events.emit({
      type: "nickname",
      nickname: nickname,
    });
  });

  events.flow.collect((event) => {
    switch (event.type) {
      case "nickname":
        setName(event.nickname);

        for (const message of messagesSnapshot()) {
          if (message.content.type != "regular") continue;

          if (message.isAuthor && message.content.title != nickname) {
            events.emit({
              type: "edit",
              nonce: message.nonce,
              message: {
                ...message,
                isAuthor: false
              }
            });
          }

          if (!message.isAuthor && message.content.title == nickname) {
            events.emit({
              type: "edit",
              nonce: message.nonce,
              message: {
                ...message,
                isAuthor: true
              }
            });
          }
        }
        break;
    }
  });

  return () => {
    return nickname;
  };
}

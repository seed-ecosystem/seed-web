import {LoadMoreUsecase} from "@/usecase/chat/load-more-usecase/load-more-usecase.ts";
import {launch} from "@/coroutines/launch.ts";
import {EventBus} from "@/usecase/chat/event-bus/event-bus.ts";
import {GetHistoryUsecase} from "@/usecase/chat/get-history-usecase/get-history-usecase.ts";

export function createLoadMoreUsecase(
  {getHistory, events}: {
    getHistory: GetHistoryUsecase,
    events: EventBus
  }
): LoadMoreUsecase {
  let nonce: number | null = null;
  const pageSize = 100;

  return () => {
    launch(async () => {
      console.log("GET MESSAGES", nonce, pageSize);

      const messages = await getHistory({
        nonce: nonce,
        amount: pageSize
      });

      if (messages.length == 0) {
        events.emit({
          type: "has_no_more",
        })
        return;
      }

      nonce = messages[messages.length - 1].nonce.server - 1;

      for (const message of messages) {
        events.emit({
          type: "new",
          message: message,
        });
      }
    });
  };
}

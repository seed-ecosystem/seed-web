import {LoadMoreUsecase} from "@/usecase/chat/load-more-usecase/load-more-usecase.ts";
import {SeedSocket} from "@/api/seed-socket.ts";
import {launch} from "@/coroutines/launch.ts";
import {GetHistoryRequest, GetHistoryResponse} from "@/api/request/get-history-request.ts";
import {HasMoreUsecase} from "@/usecase/chat/has-more-usecase/has-more-usecase.ts";
import {EventsUsecase} from "@/usecase/chat/events-usecase/events-usecase.ts";
import {MessageCoder} from "@/crypto/message-coder.ts";

export function createLoadMoreUsecase(
  api: SeedSocket,
  hasMoreUsecase: HasMoreUsecase,
  eventsUsecase: EventsUsecase,
  coder: MessageCoder
): LoadMoreUsecase {
  let nonce: number | undefined;
  const pageSize = 100;

  return () => {
    launch(async () => {

    });
  };
}

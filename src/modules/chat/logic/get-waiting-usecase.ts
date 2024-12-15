import {SeedClient} from "@/modules/client/seed-client.ts";

export interface GetWaitingUsecase {
  (): boolean;
}

export function createGetWaitingUsecase(
  {client, chatId}: {
    client: SeedClient;
    chatId: string;
  }
): GetWaitingUsecase {
  return () => client.isWaiting({chatId});
}

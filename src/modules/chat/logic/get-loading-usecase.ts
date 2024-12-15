import {SeedClient} from "@/modules/client/seed-client.ts";

export interface GetLoadingUsecase {
  (): boolean;
}

export function createGetLoadingUsecase(
  {client}: { client: SeedClient; }
): GetLoadingUsecase {
  return () => !client.isConnected;
}

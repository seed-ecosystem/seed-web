import { createObservable, Observable } from "@/coroutines/observable";

export type SeedEvent = {
  url: string;
  type: string;
  payload: unknown;
}

export interface SeedClient {
  events: Observable<SeedEvent>;
  send(): Promise<void>;
  subscribe(): Promise<void>;
}

export function createSeedClient(): SeedClient {
  const events: Observable<SeedEvent> = createObservable();

  async function execute({ }: SeedRequest): Promise<unknown> {
    return;
  }

  return {
    events,
  };
}


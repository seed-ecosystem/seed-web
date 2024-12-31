import {launch} from "@/modules/coroutines/launch.ts";
import {useEffect} from "react";
import {Flow} from "@/modules/coroutines/flow.ts";
import {createChannel} from "@/modules/coroutines/channel/create.ts";

/**
 * Synchronization primitive which guarantees to yield
 * send method only after call-site received the value
 */
export interface Channel<T> {
  isActive: boolean;

  send(element: T): Promise<boolean> & Cancellation;
  receive(): Promise<T | null> & Cancellation;
  close(): void;

  onEach(block: (element: T) => Promise<void>): Cancellation;
  map<R>(transform: (element: T) => R): Channel<R>;

  /**
   * Basically calls receive all the time until the first reject
   */
  [Symbol.asyncIterator](): AsyncIterableIterator<T>
}

export interface Cancellation {
  cancel(): void;
}

export function collectAsChannel<T>(flow: Flow<T>): Channel<T> {
  const channel = createChannel<T>();
  let subscriptionRevoked = false;
  const subscription = flow.collect(element => launch(async () => {
    if (!channel.send(element) && !subscriptionRevoked) {
      subscription.cancel();
      subscriptionRevoked = true;
    }
  }));
  return channel;
}

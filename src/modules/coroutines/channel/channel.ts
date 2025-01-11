import {Cancellation} from "@/coroutines/cancellation.ts";

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

import {OptionPredicator} from "typia/lib/programmers/helpers/OptionPredicator";
import undefined = OptionPredicator.undefined;
import {launch} from "@/modules/coroutines/launch.ts";
import {useEffect} from "react";
import {Flow} from "@/modules/coroutines/flow.ts";

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

interface Send<T> {
  element: T;
  resolve: (reason: boolean) => void;
}

interface Receive<T> {
  resolve: (value: T | null) => void;
}

export function createChannel<T>(): Channel<T> {
  const send: Send<T>[] = [];
  const receive: Receive<T>[] = [];

  let closed = false;

  return {
    get isActive(): boolean {
      return !closed;
    },

    receive() {
      let result: Receive<T>;

      const promise: any = new Promise<T | null>(resolve => {
        if (closed) return resolve(null);
        const firstSend = send.shift();
        if (firstSend) {
          resolve(firstSend.element);
          firstSend.resolve(true);
        } else {
          result = {resolve};
          receive.push(result);
        }
      });

      promise.cancel = () => {
        const index = receive.indexOf(result);
        receive.splice(index, 1);
        result.resolve(null);
      };

      return promise;
    },

    send(element: T) {
      let result: Send<T>

      const promise: any = new Promise<boolean>(resolve => {
        if (closed) return resolve(false);
        const firstReceive = receive.shift();
        if (firstReceive) {
          firstReceive.resolve(element);
          resolve(true);
        } else {
          result = {element, resolve}
          send.push(result);
        }
      });

      promise.cancel = () => {
        const index = send.indexOf(result);
        send.splice(index, 1);
        result.resolve(false);
      }

      return promise;
    },

    close(): void {
      closed = true;
      for (const element of receive) {
        element.resolve(null);
      }
      receive.splice(0, receive.length);
      for (const element of send) {
        element.resolve(false);
      }
      send.splice(0, send.length);
    },

    [Symbol.asyncIterator](): AsyncIterableIterator<T> {
      const iterator: AsyncIterableIterator<T> = {
        [Symbol.asyncIterator]: () => iterator,
        next: async () => {
          const item = await this.receive();
          if (item == null) return { done: true, value: undefined }
          return { value: item, done: false }
        },
      }

      return iterator
    },

    onEach(block: (element: T) => Promise<void>) {
      let cancellation: Cancellation | null;

      launch(async () => {
        while (true) {
          const promise = this.receive();
          cancellation = promise;
          const element = await promise;
          cancellation = null;
          if (element == null) {
            break;
          }
          await block(element);
        }
      });

      return {
        cancel() {
          cancellation?.cancel();
        }
      };
    },

    map<R>(transform: (element: T) => R): Channel<R> {
      const result = createChannel<R>();
      this.onEach(async element => {
        result.send(transform(element));
      });
      return result;
    }
  }
}

export interface Cancellation {
  cancel(): void;
}

export function useEach<T>(
  channel: () => Channel<T>,
  block: (element: T) => Promise<void>
) {
  useEffect(() => {
    const created = channel();
    created.onEach(block);
    return created.close;
  }, []);
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

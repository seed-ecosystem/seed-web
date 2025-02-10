import { Cancellation } from "@/coroutines/cancellation.ts";
import { launch } from "@/coroutines/launch.ts";

/**
 * Synchronization primitive which guarantees to yield
 * send method only after call-site received the value
 */
export interface Channel<T> {
  isActive: boolean;

  send(element: T): Promise<boolean>;
  receive(): Promise<T | null>;
  close(): void;

  onEach(block: (element: T) => Promise<void> | void): Cancellation;
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

      const promise = new Promise<T | null>(resolve => {
        if (closed) { resolve(null); return; }
        const firstSend = send.shift();
        if (firstSend) {
          resolve(firstSend.element);
          firstSend.resolve(true);
        } else {
          result = { resolve };
          receive.push(result);
        }
      });

      return promise;
    },

    send(element: T) {
      let result: Send<T>;

      const promise = new Promise<boolean>(resolve => {
        if (closed) { resolve(false); return; }
        const firstReceive = receive.shift();
        if (firstReceive) {
          firstReceive.resolve(element);
          resolve(true);
        } else {
          result = { element, resolve };
          send.push(result);
        }
      });

      return promise;
    },

    close(): void {
      if (closed) return;
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
          if (item == null) return { done: true, value: undefined };
          return { value: item, done: false };
        },
      };

      return iterator;
    },

    onEach(block: (element: T) => Promise<void> | undefined) {
      let cancelled = false;

      launch(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
          const element = await this.receive();
          if (element == null || cancelled) {
            break;
          }
          await block(element);
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (cancelled) {
            break;
          }
        }
      });

      return () => { cancelled = true; };
    },

    map<R>(transform: (element: T) => R): Channel<R> {
      const result = createChannel<R>();
      this.onEach(async element => {
        await result.send(transform(element));
      });
      return result;
    },
  };
}

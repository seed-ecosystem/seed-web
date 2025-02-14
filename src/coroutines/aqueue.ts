/**
 * This interface provides a way to have
 * fine-grained control over concurrency.
 * You can provide key in execute method and
 * for the same keys block will be executed
 * sequentially while for different keys
 * in parallel
 */
interface AQueue {
  execute<T>(key: unknown, block: () => Promise<T>): Promise<T>
}

export function createAQueue(): AQueue {
  const promises: Map<unknown, Promise<unknown>> = new Map();

  async function execute<T>(key: unknown, block: () => Promise<T>) {
    const existing = promises.get(key);
    async function promise() {
      await existing;
      return await block();
    }
    const result = promise();
    promises.set(key, result);
    return await result;
  }

  return {
    execute,
  };
}


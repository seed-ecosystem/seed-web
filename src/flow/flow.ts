export interface FlowCollector<T> {
  emit(event: T): void
}

export function flowCollector<T>(
  block: (event: T) => void
): FlowCollector<T> {
  return {
    emit(event: T) {
      block(event)
    }
  }
}

export interface Flow<T> {
  collect(collector: FlowCollector<T>): Subscription
  collect(block: (event: T) => void): Subscription
}

export function flow<T>(
  block: (collector: FlowCollector<T>) => Subscription | void
): Flow<T> {
  return {
    collect: (collector) => {
      if (!("emit" in collector)) {
        collector = flowCollector(collector);
      }

      const result = block(collector);

      if (result) {
        return result;
      }

      return { cancel: () => {} };
    }
  }
}

export interface Subscription {
  cancel(): void;
}

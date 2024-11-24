import {Flow, flowCollector, FlowCollector, Subscription} from "@/flow/flow.ts";

export interface SharedFlow<T> extends Flow<T> {}

export interface MutableSharedFlow<T> extends SharedFlow<T> {
  emit(value: T): void;
}

export function mutableSharedFlow<T>(): MutableSharedFlow<T> {
  const subscriptions: FlowCollector<T>[] = [];

  return {
    collect(collector): Subscription {
      if (!("emit" in collector)) {
        collector = flowCollector(collector);
      }

      subscriptions.push(collector);

      return {
        cancel(): void {
          const index = subscriptions.indexOf(collector);
          subscriptions.splice(index, 1);
        }
      }
    },

    emit(value: T): void {
      for (let subscription of subscriptions) {
        subscription.emit(value);
      }
    }
  };
}

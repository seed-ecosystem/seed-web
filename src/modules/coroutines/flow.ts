import {Cancellation} from "@/modules/coroutines/channel.ts";
import {useEffect} from "react";

export interface FlowCollector<T> {
  emit(event: T): void;
  cancel(): void;
}

export function flowCollector<T>(
  block: (event: T) => void,
  cancel: () => void = () => {},
): FlowCollector<T> {
  return {
    emit: block,
    cancel: cancel
  }
}

export interface Flow<T> {
  collect(collector: FlowCollector<T>): Cancellation
  collect(block: (event: T) => void): Cancellation
}

export function flow<T>(
  block: (collector: FlowCollector<T>) => Cancellation | void
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

      return {
        cancel: collector.cancel
      };
    }
  }
}

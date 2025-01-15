import {Channel, createChannel} from "@/coroutines/channel.ts";
import {launch} from "@/coroutines/launch.ts";
import {useEffect} from "react";
import {Cancellation} from "@/coroutines/cancellation.ts";

export interface Observable<T = unknown> {
  // Essential methods
  subscribe(observer: Observer<T>): Cancellation;
  emit(value: T): void;
  // 'Extension' methods
  subscribeAsChannel(): Channel<T>;
  drop(n: number): Observable<T>;
  map<R>(block: (value: T) => R): Observable<R>;
  mapNotNull<R>(block: (value: T) => R | undefined | null): Observable<R>;
  filter(predicate: (value: T) => boolean): Observable<T>;
}

export interface Observer<T> {
  (value: T): void;
}

export function useEach<T>(
  observable: Observable<T>,
  block: (element: T) => void
) {
  useEffect(() => {
    return observable.subscribe(block);
  }, []);
}

export function createObservable<T>(): Observable<T> {
  const observers: Observer<T>[] = [];

  return {
    subscribe(observer: Observer<T>): Cancellation {
      observers.push(observer);
      return () => {
        const index = observers.indexOf(observer);
        if (index == -1) return;
        observers.splice(index, 1);
      };
    },
    emit(value: T) {
      for (const observer of observers) {
        observer(value);
      }
    },
    subscribeAsChannel(): Channel<T> {
      const channel = createChannel<T>();
      const cancellation = this.subscribe(event => launch(async () => {
        if (!channel.send(event)) cancellation();
      }));
      return channel;
    },
    drop(n: number): Observable<T> {
      const observable = createObservable<T>();
      this.subscribe((value) => {
        if (n <= 0) {
          observable.emit(value);
        } else {
          n--;
        }
      })
      return observable;
    },
    map<R>(block: (value: T) => R): Observable<R> {
      const observable = createObservable<R>();
      this.subscribe((value) => observable.emit(block(value)));
      return observable;
    },
    mapNotNull<R>(block: (value: T) => R | undefined | null): Observable<R> {
      return this.map(block).filter(value => value != null) as Observable<R>;
    },
    filter(predicate: (value: T) => boolean): Observable<T> {
      const observable = createObservable<T>();
      this.subscribe((value) => {
        if (!predicate(value)) return;
        observable.emit(value);
      });
      return observable;
    },
  };
}

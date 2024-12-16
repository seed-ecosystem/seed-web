export interface Observable<T = unknown> {
  // Essential methods
  subscribe(observer: Observer<T>): Cancellation;
  emit(value: T): void;
  // 'Extension' methods
  map<R>(block: (value: T) => R): Observable<R>;
  filter(predicate: (value: T) => boolean): Observable<T>;
}

export interface Observer<T> {
  (value: T): void;
}

export interface Cancellation {
  (): void;
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
    map<R>(block: (value: T) => R): Observable<R> {
      const observable = createObservable<R>();
      this.subscribe((value) => observable.emit(block(value)));
      return observable;
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

import {createObservable, Observable} from "@/coroutines/observable.ts";

export interface NewStateHandle {
  updates: Observable<boolean>;

  getShown(): boolean;
  setShown(value: boolean): void;
}

export function createNewStateHandle(): NewStateHandle {
  const updates: Observable<boolean> = createObservable();

  let shown = false;

  return {
    updates,

    getShown: () => shown,
    setShown: (value) => {
      shown = value;
      updates.emit(value);
    },
  }
}

import {createObservable, Observable} from "@/coroutines/observable.ts";

export type ShareProps = {
  shown: true;
  chatId: string;
} | {
  shown: false
}

export interface ShareStateHandle {
  updates: Observable<ShareProps>;
  get(): ShareProps;
  set(props: ShareProps): void;
}

export function createShareStateHandle(): ShareStateHandle {
  const updates: Observable<ShareProps> = createObservable();

  let props: ShareProps = { shown: false };

  return {
    updates,
    get: () => props,
    set: (value) => {
      props = value;
      updates.emit(value);
    },
  };
}

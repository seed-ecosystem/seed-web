import {createObservable, Observable} from "@/coroutines/observable.ts";

export type DeleteProps = {
  shown: true;
  chatId: string;
} | {
  shown: false
}

export interface DeleteStateHandle {
  updates: Observable<DeleteProps>;
  get(): DeleteProps;
  set(props: DeleteProps): void;
}

export function createDeleteStateHandle(): DeleteStateHandle {
  const updates: Observable<DeleteProps> = createObservable();

  let props: DeleteProps = { shown: false };

  return {
    updates,
    get: () => props,
    set: (value) => {
      props = value;
      updates.emit(value);
    },
  }
}


import {createObservable, Observable} from "@/coroutines/observable.ts";

export type RenameProps = {
  shown: true;
  chatId: string;
  title: string;
} | {
  shown: false
}

export interface RenameStateHandle {
  updates: Observable<RenameProps>;
  get(): RenameProps;
  set(props: RenameProps): void;
}

export function createRenameStateHandle(): RenameStateHandle {
  const updates: Observable<RenameProps> = createObservable();

  let props: RenameProps = { shown: false };

  return {
    updates,
    get: () => props,
    set: (value) => {
      props = value;
      updates.emit(value);
    },
  };
}

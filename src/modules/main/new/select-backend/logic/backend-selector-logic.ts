import {createObservable, Observable} from "@/coroutines/observable.ts";

export type BackendSelectorEvent = {
  type: "option";
  value: BackendSelectorOptionLogic;
}

export interface BackendSelectorLogic {
  events: Observable<BackendSelectorEvent>;
  getOption(): BackendSelectorOptionLogic;
  setOption(type: "go" | "kt" | "custom"): void;
}

export type BackendSelectorCustomOptionEvent = {
  type: "value";
  value: string;
}

export type BackendSelectorOptionLogic = {
  type: "go";
} | {
  type: "kt";
} | {
  type: "custom";
  events: Observable<BackendSelectorCustomOptionEvent>;
  getValue(): string;
  setValue(value: string): void;
}

export function createBackendSelectorLogic(): BackendSelectorLogic {
  const events: Observable<BackendSelectorEvent> = createObservable();

  let option: BackendSelectorOptionLogic = { type: "go" };

  function setOption(type: "go" | "kt" | "custom") {
    option = createBackendSelectorOptionLogic(type);
    events.emit({ type: "option", value: option });
  }

  return {
    events,
    getOption: () => option,
    setOption,
  };
}

function createBackendSelectorOptionLogic(type: "go" | "kt" | "custom"): BackendSelectorOptionLogic {
  switch (type) {
    case "go":
    case "kt":
      return { type };
    case "custom":
      return createBackendSelectorCustomOptionLogic();
  }
}

function createBackendSelectorCustomOptionLogic(): BackendSelectorOptionLogic {
  const events: Observable<BackendSelectorCustomOptionEvent> = createObservable();

  let value = "";

  function setValue(update: string) {
    value = update;
    events.emit({ type: "value", value: update });
  }

  return {
    type: "custom",
    events,
    getValue: () => value, setValue,
  };
}

import {
  BackendSelectorLogic,
  BackendSelectorOptionLogic,
} from "@/modules/main/new/select-backend/logic/backend-selector-logic.ts";
import {
  BackendOption,
  BackendSelectorContent,
} from "@/modules/main/new/select-backend/component/backend-selector-content.tsx";
import {useState} from "react";
import {useEach} from "@/coroutines/observable.ts";

export function BackendSelector({events, getOption, setOption}: BackendSelectorLogic) {
  const [option, updateOption] = useState(() => createBackendOption(getOption()));

  useEach(events, (event) => {
    switch (event.type) {
      case "option":
        updateOption(createBackendOption(event.value));
        break;
    }
  });

  return BackendSelectorContent({option, setOption});
}

function createBackendOption(logic: BackendSelectorOptionLogic): BackendOption {
  switch (logic.type) {
    case "go":
    case "kt":
      return logic;
    case "custom":
      return {
        type: "custom",
        useValue() {
          const [value, updateValue] = useState(logic.getValue);
          useEach(logic.events, event => {
            switch (event.type) {
              case "value":
                updateValue(event.value);
                break;
            }
          });
          return [value, logic.setValue];
        },
      };
  }
}

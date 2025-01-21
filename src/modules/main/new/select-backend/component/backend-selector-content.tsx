import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";
import {Label} from "@/modules/core/components/label.tsx";
import {Input} from "@/modules/core/components/input.tsx";
import {useEffect, useMemo, useRef} from "react";

export type CustomSelectProps = {
  options: CustomSelectOptionType[];
  selectedOption: CustomSelectOption;
  setOption(type: string): void;
}

export type CustomSelectOptionType = {
  type: string;
  display: string;
}

export type CustomSelectOption = {
  type: string;
  custom: false;
} | {
  type: "custom";
  custom: true;
  useValue(): [string, (value: string) => void];
}

function CustomSelect({ options, selectedOption, setOption }: CustomSelectProps) {
  return (
    <div className="relative w-full max-w-md">
      <RadioGroup defaultValue={selectedOption.type} onValueChange={setOption}>
        {options.map((option) => (
          <div className="flex items-center space-x-2" key={option.type}>
            <RadioGroupItem value={option.type} id={option.type}/>
            <Label htmlFor={option.type}>{option.display}</Label>
          </div>
        ))}
      </RadioGroup>

      {selectedOption.custom && CustomSelectOptionContent(selectedOption)}
    </div>
  );
}

function CustomSelectOptionContent({useValue}: CustomSelectOption & { custom: true }) {
  const [value, updateValue] = useValue();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current!.value != value) {
      inputRef.current!.value = value;
    }
  }, [value]);

  return <div className="mt-2">
    <label className="block text-sm font-medium text-gray-700">
      Enter custom backend:
    </label>
    <Input
      ref={inputRef}
      onChange={event => updateValue(event.target.value)}
      type="text"
      placeholder="Server url"
      className="block w-full px-4 py-2 mt-1"
    />
  </div>
}

export type BackendSelectorProps = {
  option: BackendOption;
  setOption(type: "go" | "kt" | "custom"): void;
}

export type BackendOption = {
  type: "go";
} | {
  type: "kt";
} | {
  type: "custom";
  useValue(): [string, (value: string) => void];
}

// Usage example:
export function BackendSelectorContent({option, setOption}: BackendSelectorProps) {
  const options = [
    {
      type: "go",
      display: "Go Server",
    },
    {
      type: "kt",
      display: "Kotlin Server",
    },
    {
      type: "custom",
      display: "Custom",
    },
  ];

  const customSelectedOption: CustomSelectOption = useMemo(() => {
    const selectedOption = options.find(({type}) => type === option.type)!;

    switch (option.type) {
      case "go":
      case "kt":
        return {custom: false, ...selectedOption};
      case "custom":
        return {custom: true, ...selectedOption, ...option};
    }
  }, [option.type]);

  return (
    <CustomSelect options={options} selectedOption={customSelectedOption} setOption={setOption} />
  );
}

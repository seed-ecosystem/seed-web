import {LoadingSpinner} from "@/modules/core/components/loading-spinner.tsx";

export interface ChatTopBarProps {
  waiting: boolean;
  title: string;
}

export function ChatTopBarContent({waiting, title}: ChatTopBarProps) {
  return waiting
    ? <div className="w-full h-full flex justify-center items-center">
      <h4 className="text-2xl font-medium">{title}</h4>
    </div>
    : <Updating/>
}

function Updating() {
  return <>
    <div className="w-full h-full flex justify-center items-center"><p
      className="overflow-hidden text-ellipsis">Updating...</p><LoadingSpinner className="size-4"/></div>
  </>;
}

import {motion} from "framer-motion";
import {LoadingSpinner} from "@/modules/core/components/loading-spinner.tsx";

export interface ChatTopBarProps {
  waiting: boolean;
  title: string;
}

export function ChatTopBarContent({waiting, title}: ChatTopBarProps) {
  if (!waiting) {
    return <motion.div className="absolute left-0 right-0" key="loader" exit={{y: -10, opacity: 0}}>
      <Updating/>
    </motion.div>;
  }

  return <motion.div className="absolute left-0 right-0" key="loader" exit={{y: -10, opacity: 0}}>
    <div className="w-full h-full flex justify-center items-center">
      <h4 className="text-2xl font-medium">{title}</h4>
    </div>
  </motion.div>;
}

function Updating() {
  return <>
    <div className="w-full h-full flex justify-center items-center"><p className="overflow-hidden text-ellipsis">Updating...</p><LoadingSpinner className="size-4"/></div>
  </>;
}

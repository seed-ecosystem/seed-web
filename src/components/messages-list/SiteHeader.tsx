import {ImportChat} from "@/components/messages-list/ImportChat.tsx";

export function SiteHeader() {
  return (
    <div className="flex h-14 w-full border-b border-border/40 bg-background/95 items-center px-4">
      <h1 className="text-2xl font-medium flex-1">Seed</h1>
      <ImportChat/>
    </div>
  )
}

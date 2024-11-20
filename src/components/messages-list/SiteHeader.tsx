import {ImportChat} from "@/components/messages-list/ImportChat.tsx";

export function SiteHeader() {
  return (
    <nav className="absolute flex top-0 z-50 h-14 w-full border-b border-border/40 bg-background/95 items-center px-4">
      <h1 className="text-2xl font-medium flex-1">Seed</h1>
      <ImportChat/>
    </nav>
  )
}

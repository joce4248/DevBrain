import { SidebarNav } from "./sidebar-nav";
import { SidebarTags } from "./sidebar-tags";
import { SidebarLanguages } from "./sidebar-languages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar md:block">
      <div className="flex h-14 items-center border-b border-border px-4">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-primary">Dev</span>Mind
        </h1>
      </div>
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="flex flex-col gap-4 p-4">
          <SidebarNav />
          <Separator />
          <SidebarTags />
          <Separator />
          <SidebarLanguages />
        </div>
      </ScrollArea>
    </aside>
  );
}

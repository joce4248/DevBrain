import { SidebarNav } from "./sidebar-nav";
import { SidebarTags } from "./sidebar-tags";
import { SidebarLanguages } from "./sidebar-languages";
import { UserMenu } from "./user-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar md:flex md:flex-col">
      <div className="flex h-14 items-center border-b border-border px-4">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-primary">Dev</span>Mind
        </h1>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-4">
          <SidebarNav />
          <Separator />
          <SidebarTags />
          <Separator />
          <SidebarLanguages />
        </div>
      </ScrollArea>
      <div className="border-t border-border p-3">
        <UserMenu />
      </div>
    </aside>
  );
}

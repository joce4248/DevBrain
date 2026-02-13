"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./sidebar-nav";
import { SidebarTags } from "./sidebar-tags";
import { SidebarLanguages } from "./sidebar-languages";
import { useUIStore } from "@/stores/ui-store";

export function MobileSidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="w-64 p-0">
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
      </SheetContent>
    </Sheet>
  );
}

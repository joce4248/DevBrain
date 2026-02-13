"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Heart, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "All Snippets", href: "/", icon: Code2 },
  { label: "Favorites", href: "/favorites", icon: Heart },
  { label: "Trash", href: "/trash", icon: Trash2 },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1">
      <Button asChild className="mb-3 w-full justify-start gap-2">
        <Link href="/snippets/new">
          <Plus className="h-4 w-4" />
          New Snippet
        </Link>
      </Button>
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

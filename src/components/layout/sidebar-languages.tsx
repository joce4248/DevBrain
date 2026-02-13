"use client";

import { FileCode, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { SUPPORTED_LANGUAGES, LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";

export function SidebarLanguages() {
  const filters = useUIStore((s) => s.filters);
  const setLanguageFilter = useUIStore((s) => s.setLanguageFilter);

  return (
    <div className="flex flex-col gap-1">
      <div className="px-3 py-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Languages
        </span>
      </div>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = filters.language === lang;
        return (
          <button
            key={lang}
            onClick={() => setLanguageFilter(lang)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <FileCode className="h-3 w-3" />
            <span className="truncate">
              {LANGUAGE_DISPLAY_NAMES[lang] || lang}
            </span>
            {isActive && <X className="ml-auto h-3 w-3 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

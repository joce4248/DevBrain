"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";

export function useKeyboardShortcuts() {
  const setCommandMenuOpen = useUIStore((s) => s.setCommandMenuOpen);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandMenuOpen(true);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setCommandMenuOpen]);
}

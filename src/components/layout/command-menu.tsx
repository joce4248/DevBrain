"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Code2, Heart, Plus, Search, Trash2 } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useUIStore } from "@/stores/ui-store";
import { useSnippets } from "@/hooks/use-snippets";
import { useDebounce } from "@/hooks/use-debounce";
import { LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";

export function CommandMenu() {
  const router = useRouter();
  const open = useUIStore((s) => s.commandMenuOpen);
  const setOpen = useUIStore((s) => s.setCommandMenuOpen);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);

  const { data: snippets } = useSnippets("all", {
    search: debouncedSearch,
    language: null,
    tagIds: [],
  });

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const runAction = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search snippets or type a command..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {snippets && snippets.length > 0 && (
          <CommandGroup heading="Snippets">
            {snippets.slice(0, 8).map((snippet) => (
              <CommandItem
                key={snippet.id}
                onSelect={() =>
                  runAction(() => router.push(`/snippets/${snippet.id}`))
                }
              >
                <Code2 className="mr-2 h-4 w-4" />
                <span className="flex-1 truncate">{snippet.title}</span>
                <span className="text-xs text-muted-foreground">
                  {LANGUAGE_DISPLAY_NAMES[snippet.language] ||
                    snippet.language}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => runAction(() => router.push("/snippets/new"))}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Snippet
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => router.push("/"))}>
            <Search className="mr-2 h-4 w-4" />
            All Snippets
          </CommandItem>
          <CommandItem
            onSelect={() => runAction(() => router.push("/favorites"))}
          >
            <Heart className="mr-2 h-4 w-4" />
            Favorites
          </CommandItem>
          <CommandItem
            onSelect={() => runAction(() => router.push("/trash"))}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Trash
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

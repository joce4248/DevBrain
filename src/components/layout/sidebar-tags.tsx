"use client";

import { useState } from "react";
import { Plus, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTags, useCreateTag } from "@/hooks/use-tags";
import { useUIStore } from "@/stores/ui-store";
import { TAG_COLORS } from "@/lib/constants";

export function SidebarTags() {
  const { data: tags } = useTags();
  const createTag = useCreateTag();
  const filters = useUIStore((s) => s.filters);
  const toggleTagFilter = useUIStore((s) => s.toggleTagFilter);

  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(TAG_COLORS[0]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    createTag.mutate(
      { name: newTagName.trim(), color: selectedColor },
      {
        onSuccess: () => {
          setNewTagName("");
          setPopoverOpen(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-3 py-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tags
        </span>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                className="h-8"
              />
              <div className="flex flex-wrap gap-1.5">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "h-5 w-5 rounded-full transition-transform",
                      selectedColor === color && "scale-125 ring-2 ring-ring ring-offset-2 ring-offset-background"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <Button size="sm" onClick={handleCreateTag} className="h-7">
                Create
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {tags?.map((tag) => {
        const isActive = filters.tagIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            onClick={() => toggleTagFilter(tag.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <Tag className="h-3 w-3" style={{ color: tag.color }} />
            <span className="truncate">{tag.name}</span>
            {isActive && (
              <X className="ml-auto h-3 w-3 shrink-0" />
            )}
          </button>
        );
      })}
      {tags?.length === 0 && (
        <p className="px-3 py-1 text-xs text-muted-foreground">
          No tags yet
        </p>
      )}
    </div>
  );
}

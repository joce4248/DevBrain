"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { SUPPORTED_LANGUAGES, LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";
import { useTags } from "@/hooks/use-tags";
import type { Tag } from "@/types";

interface SnippetMetaFormProps {
  title: string;
  description: string;
  language: string;
  selectedTagIds: string[];
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onLanguageChange: (language: string) => void;
  onTagToggle: (tagId: string) => void;
}

export function SnippetMetaForm({
  title,
  description,
  language,
  selectedTagIds,
  onTitleChange,
  onDescriptionChange,
  onLanguageChange,
  onTagToggle,
}: SnippetMetaFormProps) {
  const { data: tags } = useTags();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Title</label>
        <Input
          placeholder="Snippet title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Description</label>
        <Textarea
          placeholder="Optional description..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Language</label>
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {LANGUAGE_DISPLAY_NAMES[lang] || lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Tags</label>
        <div className="flex flex-wrap gap-1.5">
          {tags?.map((tag: Tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onTagToggle(tag.id)}
              >
                <Badge
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer gap-1 transition-colors"
                  style={
                    isSelected
                      ? { backgroundColor: tag.color, borderColor: tag.color }
                      : { borderColor: tag.color, color: tag.color }
                  }
                >
                  {tag.name}
                  {isSelected && <X className="h-2.5 w-2.5" />}
                </Badge>
              </button>
            );
          })}
          {(!tags || tags.length === 0) && (
            <p className="text-xs text-muted-foreground">
              No tags created yet. Add them from the sidebar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

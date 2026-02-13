"use client";

import { SnippetCard } from "./snippet-card";
import { SnippetCardSkeleton } from "./snippet-card-skeleton";
import { SnippetEmptyState } from "./snippet-empty-state";
import type { SnippetWithTags, SnippetView } from "@/types";

interface SnippetGridProps {
  snippets: SnippetWithTags[];
  isLoading: boolean;
  view: SnippetView;
  onDelete?: (id: string) => void;
}

export function SnippetGrid({
  snippets,
  isLoading,
  view,
  onDelete,
}: SnippetGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SnippetCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (snippets.length === 0) {
    return <SnippetEmptyState view={view} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {snippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          view={view}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

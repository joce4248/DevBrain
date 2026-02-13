"use client";

import { SnippetGrid } from "@/components/snippets/snippet-grid";
import { useSnippets } from "@/hooks/use-snippets";
import { useUIStore } from "@/stores/ui-store";

export default function FavoritesPage() {
  const filters = useUIStore((s) => s.filters);
  const { data: snippets, isLoading } = useSnippets("favorites", filters);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Favorites</h2>
        <p className="text-sm text-muted-foreground">
          Your starred code snippets
        </p>
      </div>
      <SnippetGrid
        snippets={snippets || []}
        isLoading={isLoading}
        view="favorites"
      />
    </div>
  );
}

import Link from "next/link";
import { Code2, Heart, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SnippetView } from "@/types";

const emptyStates: Record<
  SnippetView,
  { icon: typeof Code2; title: string; description: string }
> = {
  all: {
    icon: Code2,
    title: "No snippets yet",
    description: "Create your first code snippet to get started.",
  },
  favorites: {
    icon: Heart,
    title: "No favorites yet",
    description: "Star snippets to add them to your favorites.",
  },
  trash: {
    icon: Trash2,
    title: "Trash is empty",
    description: "Deleted snippets will appear here.",
  },
};

export function SnippetEmptyState({ view }: { view: SnippetView }) {
  const state = emptyStates[view];
  const Icon = state.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-lg font-semibold">{state.title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {state.description}
      </p>
      {view === "all" && (
        <Button asChild>
          <Link href="/snippets/new">
            <Plus className="mr-2 h-4 w-4" />
            New Snippet
          </Link>
        </Button>
      )}
    </div>
  );
}

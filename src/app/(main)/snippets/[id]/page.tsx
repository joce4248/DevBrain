"use client";

import { use } from "react";
import { SnippetEditor } from "@/components/snippets/snippet-editor";
import { useSnippet } from "@/hooks/use-snippets";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditSnippetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: snippet, isLoading } = useSnippet(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h3 className="text-lg font-semibold">Snippet not found</h3>
        <p className="text-sm text-muted-foreground">
          This snippet may have been deleted.
        </p>
      </div>
    );
  }

  return <SnippetEditor snippet={snippet} />;
}

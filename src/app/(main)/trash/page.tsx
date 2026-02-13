"use client";

import { useState } from "react";
import { SnippetGrid } from "@/components/snippets/snippet-grid";
import { DeleteDialog } from "@/components/snippets/delete-dialog";
import { useSnippets, usePermanentDeleteSnippet } from "@/hooks/use-snippets";
import { useUIStore } from "@/stores/ui-store";
import { toast } from "sonner";

export default function TrashPage() {
  const filters = useUIStore((s) => s.filters);
  const { data: snippets, isLoading } = useSnippets("trash", filters);
  const permanentDelete = usePermanentDeleteSnippet();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    permanentDelete.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Snippet permanently deleted");
        setDeleteId(null);
      },
      onError: () => {
        toast.error("Failed to delete snippet");
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Trash</h2>
        <p className="text-sm text-muted-foreground">
          Deleted snippets. Restore or permanently delete.
        </p>
      </div>
      <SnippetGrid
        snippets={snippets || []}
        isLoading={isLoading}
        view="trash"
        onDelete={setDeleteId}
      />
      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isPending={permanentDelete.isPending}
      />
    </div>
  );
}

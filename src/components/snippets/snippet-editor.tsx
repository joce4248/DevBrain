"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SnippetMetaForm } from "./snippet-meta-form";
import { SnippetCodeEditor } from "./snippet-code-editor";
import { useCreateSnippet, useUpdateSnippet } from "@/hooks/use-snippets";
import { useEditorStore } from "@/stores/editor-store";
import { toast } from "sonner";
import type { SnippetWithTags } from "@/types";

interface SnippetEditorProps {
  snippet?: SnippetWithTags;
}

export function SnippetEditor({ snippet }: SnippetEditorProps) {
  const router = useRouter();
  const createSnippet = useCreateSnippet();
  const updateSnippet = useUpdateSnippet();
  const setIsDirty = useEditorStore((s) => s.setIsDirty);

  const [title, setTitle] = useState(snippet?.title || "");
  const [description, setDescription] = useState(snippet?.description || "");
  const [language, setLanguage] = useState(snippet?.language || "typescript");
  const [content, setContent] = useState(snippet?.content || "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    snippet?.tags.map((t) => t.id) || []
  );

  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title);
      setDescription(snippet.description || "");
      setLanguage(snippet.language);
      setContent(snippet.content);
      setSelectedTagIds(snippet.tags.map((t) => t.id));
    }
  }, [snippet]);

  const markDirty = useCallback(() => setIsDirty(true), [setIsDirty]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    markDirty();
  };
  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    markDirty();
  };
  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    markDirty();
  };
  const handleContentChange = (val: string) => {
    setContent(val);
    markDirty();
  };
  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
    markDirty();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Code content is required");
      return;
    }

    try {
      if (snippet) {
        await updateSnippet.mutateAsync({
          id: snippet.id,
          title: title.trim(),
          description: description.trim() || undefined,
          language,
          content,
          tagIds: selectedTagIds,
        });
        toast.success("Snippet updated");
      } else {
        const created = await createSnippet.mutateAsync({
          title: title.trim(),
          description: description.trim() || undefined,
          language,
          content,
          tagIds: selectedTagIds,
        });
        toast.success("Snippet created");
        router.push(`/snippets/${created.id}`);
      }
      setIsDirty(false);
    } catch {
      toast.error("Failed to save snippet");
    }
  };

  const isSaving = createSnippet.isPending || updateSnippet.isPending;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold tracking-tight">
            {snippet ? "Edit Snippet" : "New Snippet"}
          </h2>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <SnippetMetaForm
          title={title}
          description={description}
          language={language}
          selectedTagIds={selectedTagIds}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          onLanguageChange={handleLanguageChange}
          onTagToggle={handleTagToggle}
        />
        <SnippetCodeEditor
          value={content}
          onChange={handleContentChange}
          language={language}
        />
      </div>
    </div>
  );
}

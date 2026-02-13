"use client";

import Link from "next/link";
import { Heart, Trash2, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LanguageBadge } from "./language-badge";
import { TagBadge } from "./tag-badge";
import { CopyButton } from "./copy-button";
import { useToggleFavorite, useSoftDeleteSnippet, useRestoreSnippet } from "@/hooks/use-snippets";
import type { SnippetWithTags, SnippetView } from "@/types";

interface SnippetCardProps {
  snippet: SnippetWithTags;
  view: SnippetView;
  onDelete?: (id: string) => void;
}

export function SnippetCard({ snippet, view, onDelete }: SnippetCardProps) {
  const toggleFavorite = useToggleFavorite();
  const softDelete = useSoftDeleteSnippet();
  const restore = useRestoreSnippet();

  const codePreview = snippet.content
    .split("\n")
    .slice(0, 5)
    .join("\n");

  const isTrash = view === "trash";

  return (
    <Card className="group overflow-hidden transition-colors hover:border-primary/30">
      <Link href={isTrash ? "#" : `/snippets/${snippet.id}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold leading-tight">
              {snippet.title}
            </h3>
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              {!isTrash && (
                <>
                  <CopyButton text={snippet.content} className="h-7 w-7" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite.mutate({
                            id: snippet.id,
                            is_favorite: !snippet.is_favorite,
                          });
                        }}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${
                            snippet.is_favorite
                              ? "fill-red-500 text-red-500"
                              : ""
                          }`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {snippet.is_favorite ? "Remove from favorites" : "Add to favorites"}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          softDelete.mutate(snippet.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Move to trash</TooltipContent>
                  </Tooltip>
                </>
              )}
              {isTrash && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          restore.mutate(snippet.id);
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Restore</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete?.(snippet.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete permanently</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
          {snippet.description && (
            <p className="truncate text-xs text-muted-foreground">
              {snippet.description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <pre className="overflow-hidden rounded-md bg-muted/50 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
            <code>{codePreview}</code>
          </pre>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <LanguageBadge language={snippet.language} />
            {snippet.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
            {snippet.is_favorite && !isTrash && (
              <Heart className="ml-auto h-3 w-3 fill-red-500 text-red-500" />
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

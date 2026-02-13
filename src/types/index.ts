export interface Snippet {
  id: string;
  title: string;
  content: string;
  description: string | null;
  language: string;
  is_favorite: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface SnippetTag {
  snippet_id: string;
  tag_id: string;
}

export interface SnippetWithTags extends Snippet {
  tags: Tag[];
}

export interface FilterState {
  search: string;
  language: string | null;
  tagIds: string[];
}

export type ViewMode = "grid" | "list";

export type SnippetView = "all" | "favorites" | "trash";

export interface CreateSnippetInput {
  title: string;
  content: string;
  description?: string;
  language: string;
  tagIds?: string[];
}

export interface UpdateSnippetInput {
  id: string;
  title?: string;
  content?: string;
  description?: string;
  language?: string;
  tagIds?: string[];
}

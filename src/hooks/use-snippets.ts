"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  Snippet,
  CreateSnippetInput,
  FilterState,
  SnippetWithTags,
  Tag,
  UpdateSnippetInput,
} from "@/types";

const supabase = createClient();

function snippetKeys() {
  return ["snippets"] as const;
}

async function fetchSnippetsWithTags(
  view: "all" | "favorites" | "trash",
  filters: FilterState
): Promise<SnippetWithTags[]> {
  let query = supabase.from("snippets").select("*");

  if (view === "trash") {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
    if (view === "favorites") {
      query = query.eq("is_favorite", true);
    }
  }

  if (filters.language) {
    query = query.eq("language", filters.language);
  }

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  query = query.order("updated_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  const snippets = (data || []) as Snippet[];
  if (snippets.length === 0) return [];

  const snippetIds = snippets.map((s) => s.id);

  const { data: stData, error: stError } = await supabase
    .from("snippet_tags")
    .select("*")
    .in("snippet_id", snippetIds);
  if (stError) throw stError;

  const snippetTags = (stData || []) as { snippet_id: string; tag_id: string }[];
  const tagIds = [...new Set(snippetTags.map((st) => st.tag_id))];

  let tagsMap: Record<string, Tag> = {};
  if (tagIds.length > 0) {
    const { data: tData, error: tError } = await supabase
      .from("tags")
      .select("*")
      .in("id", tagIds);
    if (tError) throw tError;
    const tags = (tData || []) as Tag[];
    tagsMap = Object.fromEntries(tags.map((t) => [t.id, t]));
  }

  const snippetTagMap: Record<string, string[]> = {};
  snippetTags.forEach((st) => {
    if (!snippetTagMap[st.snippet_id]) snippetTagMap[st.snippet_id] = [];
    snippetTagMap[st.snippet_id].push(st.tag_id);
  });

  let result: SnippetWithTags[] = snippets.map((s) => ({
    ...s,
    tags: (snippetTagMap[s.id] || [])
      .map((tid) => tagsMap[tid])
      .filter(Boolean),
  }));

  if (filters.tagIds.length > 0) {
    result = result.filter((s) =>
      filters.tagIds.every((tid) => s.tags.some((t) => t.id === tid))
    );
  }

  return result;
}

export function useSnippets(
  view: "all" | "favorites" | "trash",
  filters: FilterState
) {
  return useQuery({
    queryKey: ["snippets", view, filters],
    queryFn: () => fetchSnippetsWithTags(view, filters),
  });
}

export function useSnippet(id: string) {
  return useQuery({
    queryKey: ["snippet", id],
    queryFn: async (): Promise<SnippetWithTags> => {
      const { data, error } = await supabase
        .from("snippets")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;

      const snippet = data as Snippet;

      const { data: stData } = await supabase
        .from("snippet_tags")
        .select("*")
        .eq("snippet_id", id);

      const tagIds = ((stData || []) as { tag_id: string }[]).map(
        (st) => st.tag_id
      );
      let tags: Tag[] = [];
      if (tagIds.length > 0) {
        const { data: tData } = await supabase
          .from("tags")
          .select("*")
          .in("id", tagIds);
        tags = (tData || []) as Tag[];
      }

      return { ...snippet, tags };
    },
    enabled: !!id,
  });
}

export function useCreateSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSnippetInput): Promise<{ id: string }> => {
      const { tagIds, ...snippetData } = input;
      const insertData = {
        title: snippetData.title,
        content: snippetData.content,
        language: snippetData.language,
        description: snippetData.description ?? null,
      };
      const { data, error } = await supabase
        .from("snippets")
        .insert(insertData)
        .select("*")
        .single();
      if (error) throw error;

      const snippet = data as Snippet;

      if (tagIds && tagIds.length > 0) {
        const { error: stError } = await supabase
          .from("snippet_tags")
          .insert(tagIds.map((tag_id) => ({ snippet_id: snippet.id, tag_id })));
        if (stError) throw stError;
      }

      return { id: snippet.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: snippetKeys() });
    },
  });
}

export function useUpdateSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateSnippetInput) => {
      const { id, tagIds, ...updateData } = input;

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from("snippets")
          .update(updateData)
          .eq("id", id);
        if (error) throw error;
      }

      if (tagIds !== undefined) {
        await supabase.from("snippet_tags").delete().eq("snippet_id", id);
        if (tagIds.length > 0) {
          const { error: stError } = await supabase
            .from("snippet_tags")
            .insert(tagIds.map((tag_id) => ({ snippet_id: id, tag_id })));
          if (stError) throw stError;
        }
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: snippetKeys() });
      queryClient.invalidateQueries({
        queryKey: ["snippet", variables.id],
      });
    },
  });
}

export function useSoftDeleteSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("snippets")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: snippetKeys() });
    },
  });
}

export function useRestoreSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("snippets")
        .update({ deleted_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: snippetKeys() });
    },
  });
}

export function usePermanentDeleteSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("snippets")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: snippetKeys() });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      is_favorite,
    }: {
      id: string;
      is_favorite: boolean;
    }) => {
      const { error } = await supabase
        .from("snippets")
        .update({ is_favorite })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: snippetKeys() });
      queryClient.invalidateQueries({
        queryKey: ["snippet", variables.id],
      });
    },
  });
}

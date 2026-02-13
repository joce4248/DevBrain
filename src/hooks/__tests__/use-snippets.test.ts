import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "@/test-utils/react-query";
import { createSupabaseChain, getMockedSupabase } from "@/test-utils/supabase-mock";
import {
  useSnippets,
  useSnippet,
  useCreateSnippet,
  useUpdateSnippet,
  useSoftDeleteSnippet,
  useRestoreSnippet,
  usePermanentDeleteSnippet,
  useToggleFavorite,
} from "../use-snippets";
import type { FilterState } from "@/types";

const emptyFilters: FilterState = { search: "", language: null, tagIds: [] };

const mockSnippet = {
  id: "s1",
  title: "Test Snippet",
  content: "console.log('hello')",
  description: null,
  language: "typescript",
  is_favorite: false,
  deleted_at: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  user_id: "u1",
};

describe("useSnippets", () => {
  const mockSupabase = getMockedSupabase();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches snippets with tags for 'all' view", async () => {
    // First call: snippets query
    // Second call: snippet_tags query
    let callCount = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      callCount++;
      if (table === "snippets") {
        return createSupabaseChain({ data: [mockSnippet], error: null });
      }
      if (table === "snippet_tags") {
        return createSupabaseChain({ data: [], error: null });
      }
      return createSupabaseChain({ data: [], error: null });
    });

    const { result } = renderHook(
      () => useSnippets("all", emptyFilters),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].tags).toEqual([]);
  });

  it("fetches snippets with resolved tags", async () => {
    const snippetTag = { snippet_id: "s1", tag_id: "t1" };
    const tag = { id: "t1", name: "react", color: "#3b82f6", user_id: "u1" };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "snippets") {
        return createSupabaseChain({ data: [mockSnippet], error: null });
      }
      if (table === "snippet_tags") {
        return createSupabaseChain({ data: [snippetTag], error: null });
      }
      if (table === "tags") {
        return createSupabaseChain({ data: [tag], error: null });
      }
      return createSupabaseChain({ data: [], error: null });
    });

    const { result } = renderHook(
      () => useSnippets("all", emptyFilters),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0].tags).toEqual([tag]);
  });

  it("filters by tagIds client-side", async () => {
    const snippetTag = { snippet_id: "s1", tag_id: "t1" };
    const tag = { id: "t1", name: "react", color: "#3b82f6", user_id: "u1" };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "snippets") {
        return createSupabaseChain({ data: [mockSnippet], error: null });
      }
      if (table === "snippet_tags") {
        return createSupabaseChain({ data: [snippetTag], error: null });
      }
      if (table === "tags") {
        return createSupabaseChain({ data: [tag], error: null });
      }
      return createSupabaseChain({ data: [], error: null });
    });

    // Filter by tag that doesn't exist on snippet
    const filters: FilterState = { search: "", language: null, tagIds: ["t999"] };
    const { result } = renderHook(
      () => useSnippets("all", filters),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("returns empty array when no snippets", async () => {
    mockSupabase.from.mockReturnValue(
      createSupabaseChain({ data: [], error: null })
    );

    const { result } = renderHook(
      () => useSnippets("all", emptyFilters),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("throws on snippet query error", async () => {
    mockSupabase.from.mockReturnValue(
      createSupabaseChain({ data: null, error: { message: "DB error" } })
    );

    const { result } = renderHook(
      () => useSnippets("all", emptyFilters),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useSnippet", () => {
  const mockSupabase = getMockedSupabase();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches a single snippet with tags", async () => {
    const tag = { id: "t1", name: "react", color: "#3b82f6", user_id: "u1" };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "snippets") {
        return createSupabaseChain({ data: mockSnippet, error: null });
      }
      if (table === "snippet_tags") {
        return createSupabaseChain({
          data: [{ snippet_id: "s1", tag_id: "t1" }],
          error: null,
        });
      }
      if (table === "tags") {
        return createSupabaseChain({ data: [tag], error: null });
      }
      return createSupabaseChain({ data: [], error: null });
    });

    const { result } = renderHook(() => useSnippet("s1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.title).toBe("Test Snippet");
    expect(result.current.data?.tags).toEqual([tag]);
  });

  it("is disabled when id is empty", () => {
    const { result } = renderHook(() => useSnippet(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateSnippet", () => {
  const mockSupabase = getMockedSupabase();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a snippet with tags", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "u1" } },
    });
    // First from("snippets").insert, then from("snippet_tags").insert
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "snippets") {
        return createSupabaseChain({
          data: { ...mockSnippet, id: "new-1" },
          error: null,
        });
      }
      if (table === "snippet_tags") {
        return createSupabaseChain({ data: null, error: null });
      }
      return createSupabaseChain({ data: null, error: null });
    });

    const { result } = renderHook(() => useCreateSnippet(), {
      wrapper: createWrapper(),
    });

    const res = await result.current.mutateAsync({
      title: "New",
      content: "code",
      language: "typescript",
      tagIds: ["t1"],
    });

    expect(res.id).toBe("new-1");
  });

  it("throws if not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    const { result } = renderHook(() => useCreateSnippet(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        title: "New",
        content: "code",
        language: "typescript",
      })
    ).rejects.toThrow("Not authenticated");
  });
});

describe("useUpdateSnippet", () => {
  const mockSupabase = getMockedSupabase();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates snippet fields", async () => {
    mockSupabase.from.mockReturnValue(
      createSupabaseChain({ data: null, error: null })
    );

    const { result } = renderHook(() => useUpdateSnippet(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ id: "s1", title: "Updated" });
    expect(mockSupabase.from).toHaveBeenCalledWith("snippets");
  });

  it("replaces tags when tagIds provided", async () => {
    mockSupabase.from.mockReturnValue(
      createSupabaseChain({ data: null, error: null })
    );

    const { result } = renderHook(() => useUpdateSnippet(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ id: "s1", tagIds: ["t1", "t2"] });
    // Called for snippet_tags delete + insert
    expect(mockSupabase.from).toHaveBeenCalledWith("snippet_tags");
  });
});

describe("useSoftDeleteSnippet", () => {
  const mockSupabase = getMockedSupabase();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft deletes by setting deleted_at", async () => {
    mockSupabase.from.mockReturnValue(
      createSupabaseChain({ data: null, error: null })
    );

    const { result } = renderHook(() => useSoftDeleteSnippet(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync("s1");
    expect(mockSupabase.from).toHaveBeenCalledWith("snippets");
  });
});

describe("useRestoreSnippet", () => {
  const mockSupabase = getMockedSupabase();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("restores by setting deleted_at to null", async () => {
    mockSupabase.from.mockReturnValue(
      createSupabaseChain({ data: null, error: null })
    );

    const { result } = renderHook(() => useRestoreSnippet(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync("s1");
    expect(mockSupabase.from).toHaveBeenCalledWith("snippets");
  });
});

describe("usePermanentDeleteSnippet", () => {
  const mockSupabase = getMockedSupabase();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permanently deletes", async () => {
    mockSupabase.from.mockReturnValue(
      createSupabaseChain({ data: null, error: null })
    );

    const { result } = renderHook(() => usePermanentDeleteSnippet(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync("s1");
    expect(mockSupabase.from).toHaveBeenCalledWith("snippets");
  });
});

describe("useToggleFavorite", () => {
  const mockSupabase = getMockedSupabase();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("toggles favorite status", async () => {
    mockSupabase.from.mockReturnValue(
      createSupabaseChain({ data: null, error: null })
    );

    const { result } = renderHook(() => useToggleFavorite(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ id: "s1", is_favorite: true });
    expect(mockSupabase.from).toHaveBeenCalledWith("snippets");
  });
});

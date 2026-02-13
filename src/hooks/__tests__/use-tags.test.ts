import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "@/test-utils/react-query";
import { createSupabaseChain, getMockedSupabase } from "@/test-utils/supabase-mock";
import { useTags, useCreateTag, useDeleteTag } from "../use-tags";

describe("useTags", () => {
  const mockSupabase = getMockedSupabase();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches tags successfully", async () => {
    const tags = [
      { id: "1", name: "react", color: "#3b82f6", user_id: "u1" },
      { id: "2", name: "typescript", color: "#6366f1", user_id: "u1" },
    ];
    mockSupabase.from.mockReturnValue(
      createSupabaseChain({ data: tags, error: null })
    );

    const { result } = renderHook(() => useTags(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(tags);
    expect(mockSupabase.from).toHaveBeenCalledWith("tags");
  });

  it("handles fetch error", async () => {
    mockSupabase.from.mockReturnValue(
      createSupabaseChain({ data: null, error: { message: "DB error" } })
    );

    const { result } = renderHook(() => useTags(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("returns empty array when no tags", async () => {
    mockSupabase.from.mockReturnValue(
      createSupabaseChain({ data: [], error: null })
    );

    const { result } = renderHook(() => useTags(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useCreateTag", () => {
  const mockSupabase = getMockedSupabase();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a tag with user_id", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "u1" } },
    });
    mockSupabase.from.mockReturnValue(
      createSupabaseChain({
        data: { id: "3", name: "vue", color: "#22c55e", user_id: "u1" },
        error: null,
      })
    );

    const { result } = renderHook(() => useCreateTag(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ name: "vue", color: "#22c55e" });

    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith("tags");
  });

  it("throws if not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    const { result } = renderHook(() => useCreateTag(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({ name: "vue", color: "#22c55e" })
    ).rejects.toThrow("Not authenticated");
  });
});

describe("useDeleteTag", () => {
  const mockSupabase = getMockedSupabase();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a tag by id", async () => {
    mockSupabase.from.mockReturnValue(
      createSupabaseChain({ data: null, error: null })
    );

    const { result } = renderHook(() => useDeleteTag(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync("tag-1");
    expect(mockSupabase.from).toHaveBeenCalledWith("tags");
  });
});

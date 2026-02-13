import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCopyClipboard } from "../use-copy-clipboard";

describe("useCopyClipboard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("initializes with copied = false", () => {
    const { result } = renderHook(() => useCopyClipboard());
    expect(result.current.copied).toBe(false);
  });

  it("copies text and sets copied to true", async () => {
    const { result } = renderHook(() => useCopyClipboard());

    await act(async () => {
      const success = await result.current.copy("hello");
      expect(success).toBe(true);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello");
    expect(result.current.copied).toBe(true);
  });

  it("resets copied to false after timeout", async () => {
    const { result } = renderHook(() => useCopyClipboard(1000));

    await act(async () => {
      await result.current.copy("hello");
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.copied).toBe(false);
  });

  it("returns false when clipboard fails", async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
      new Error("Clipboard access denied")
    );

    const { result } = renderHook(() => useCopyClipboard());

    await act(async () => {
      const success = await result.current.copy("hello");
      expect(success).toBe(false);
    });

    expect(result.current.copied).toBe(false);
  });

  it("uses default timeout of 2000ms", async () => {
    const { result } = renderHook(() => useCopyClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.copied).toBe(false);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "../ui-store";

const initialFilters = { search: "", language: null, tagIds: [] as string[] };

describe("useUIStore", () => {
  beforeEach(() => {
    useUIStore.setState({
      filters: { ...initialFilters, tagIds: [] },
      viewMode: "grid",
      sidebarOpen: false,
      commandMenuOpen: false,
    });
  });

  describe("filters", () => {
    it("has correct initial filters", () => {
      const { filters } = useUIStore.getState();
      expect(filters).toEqual(initialFilters);
    });

    it("setSearch updates search", () => {
      useUIStore.getState().setSearch("hello");
      expect(useUIStore.getState().filters.search).toBe("hello");
    });

    it("setLanguageFilter sets language", () => {
      useUIStore.getState().setLanguageFilter("python");
      expect(useUIStore.getState().filters.language).toBe("python");
    });

    it("setLanguageFilter toggles same language to null", () => {
      useUIStore.getState().setLanguageFilter("python");
      useUIStore.getState().setLanguageFilter("python");
      expect(useUIStore.getState().filters.language).toBeNull();
    });

    it("setLanguageFilter switches to different language", () => {
      useUIStore.getState().setLanguageFilter("python");
      useUIStore.getState().setLanguageFilter("rust");
      expect(useUIStore.getState().filters.language).toBe("rust");
    });

    it("toggleTagFilter adds a tag", () => {
      useUIStore.getState().toggleTagFilter("tag-1");
      expect(useUIStore.getState().filters.tagIds).toEqual(["tag-1"]);
    });

    it("toggleTagFilter removes an existing tag", () => {
      useUIStore.getState().toggleTagFilter("tag-1");
      useUIStore.getState().toggleTagFilter("tag-1");
      expect(useUIStore.getState().filters.tagIds).toEqual([]);
    });

    it("toggleTagFilter accumulates multiple tags", () => {
      useUIStore.getState().toggleTagFilter("tag-1");
      useUIStore.getState().toggleTagFilter("tag-2");
      expect(useUIStore.getState().filters.tagIds).toEqual(["tag-1", "tag-2"]);
    });

    it("clearFilters resets all filters", () => {
      useUIStore.getState().setSearch("test");
      useUIStore.getState().setLanguageFilter("python");
      useUIStore.getState().toggleTagFilter("tag-1");
      useUIStore.getState().clearFilters();
      expect(useUIStore.getState().filters).toEqual(initialFilters);
    });
  });

  describe("UI toggles", () => {
    it("setViewMode updates viewMode", () => {
      useUIStore.getState().setViewMode("list");
      expect(useUIStore.getState().viewMode).toBe("list");
    });

    it("setSidebarOpen updates sidebarOpen", () => {
      useUIStore.getState().setSidebarOpen(true);
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it("setCommandMenuOpen updates commandMenuOpen", () => {
      useUIStore.getState().setCommandMenuOpen(true);
      expect(useUIStore.getState().commandMenuOpen).toBe(true);
    });
  });
});

import { create } from "zustand";
import type { FilterState, ViewMode } from "@/types";

interface UIState {
  filters: FilterState;
  viewMode: ViewMode;
  sidebarOpen: boolean;
  commandMenuOpen: boolean;

  setSearch: (search: string) => void;
  setLanguageFilter: (language: string | null) => void;
  toggleTagFilter: (tagId: string) => void;
  clearFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSidebarOpen: (open: boolean) => void;
  setCommandMenuOpen: (open: boolean) => void;
}

const initialFilters: FilterState = {
  search: "",
  language: null,
  tagIds: [],
};

export const useUIStore = create<UIState>((set) => ({
  filters: initialFilters,
  viewMode: "grid",
  sidebarOpen: false,
  commandMenuOpen: false,

  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search } })),

  setLanguageFilter: (language) =>
    set((state) => ({
      filters: {
        ...state.filters,
        language: state.filters.language === language ? null : language,
      },
    })),

  toggleTagFilter: (tagId) =>
    set((state) => ({
      filters: {
        ...state.filters,
        tagIds: state.filters.tagIds.includes(tagId)
          ? state.filters.tagIds.filter((id) => id !== tagId)
          : [...state.filters.tagIds, tagId],
      },
    })),

  clearFilters: () => set({ filters: initialFilters }),

  setViewMode: (viewMode) => set({ viewMode }),

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  setCommandMenuOpen: (commandMenuOpen) => set({ commandMenuOpen }),
}));

import { create } from "zustand";

interface EditorState {
  isDirty: boolean;
  language: string;

  setIsDirty: (dirty: boolean) => void;
  setLanguage: (language: string) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  isDirty: false,
  language: "typescript",

  setIsDirty: (isDirty) => set({ isDirty }),
  setLanguage: (language) => set({ language }),
  reset: () => set({ isDirty: false, language: "typescript" }),
}));

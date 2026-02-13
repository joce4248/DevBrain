import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../editor-store";

describe("useEditorStore", () => {
  beforeEach(() => {
    useEditorStore.setState({ isDirty: false, language: "typescript" });
  });

  it("has correct initial state", () => {
    const state = useEditorStore.getState();
    expect(state.isDirty).toBe(false);
    expect(state.language).toBe("typescript");
  });

  it("setIsDirty updates isDirty", () => {
    useEditorStore.getState().setIsDirty(true);
    expect(useEditorStore.getState().isDirty).toBe(true);
  });

  it("setLanguage updates language", () => {
    useEditorStore.getState().setLanguage("python");
    expect(useEditorStore.getState().language).toBe("python");
  });

  it("reset restores initial state", () => {
    useEditorStore.getState().setIsDirty(true);
    useEditorStore.getState().setLanguage("rust");
    useEditorStore.getState().reset();

    const state = useEditorStore.getState();
    expect(state.isDirty).toBe(false);
    expect(state.language).toBe("typescript");
  });
});

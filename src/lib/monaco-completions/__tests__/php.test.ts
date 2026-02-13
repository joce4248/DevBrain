import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerPhpCompletions } from "../php";

function createMockMonaco() {
  return {
    languages: {
      registerCompletionItemProvider: vi.fn(),
      CompletionItemKind: {
        Function: 1,
      },
    },
  };
}

describe("registerPhpCompletions", () => {
  let mockMonaco: ReturnType<typeof createMockMonaco>;

  beforeEach(() => {
    mockMonaco = createMockMonaco();
  });

  it("registers a completion provider for php", () => {
    registerPhpCompletions(mockMonaco as never);

    expect(
      mockMonaco.languages.registerCompletionItemProvider
    ).toHaveBeenCalledOnce();
    expect(
      mockMonaco.languages.registerCompletionItemProvider
    ).toHaveBeenCalledWith("php", expect.objectContaining({
      provideCompletionItems: expect.any(Function),
    }));
  });

  it("provides suggestions with correct structure", () => {
    registerPhpCompletions(mockMonaco as never);

    const provider =
      mockMonaco.languages.registerCompletionItemProvider.mock.calls[0][1];

    const mockModel = {
      getWordUntilPosition: vi.fn().mockReturnValue({
        startColumn: 1,
        endColumn: 4,
      }),
    };
    const mockPosition = { lineNumber: 1, column: 4 };

    const result = provider.provideCompletionItems(mockModel, mockPosition);

    expect(result.suggestions).toBeDefined();
    expect(result.suggestions.length).toBeGreaterThan(100);
  });

  it("each suggestion has required fields", () => {
    registerPhpCompletions(mockMonaco as never);

    const provider =
      mockMonaco.languages.registerCompletionItemProvider.mock.calls[0][1];

    const mockModel = {
      getWordUntilPosition: vi.fn().mockReturnValue({
        startColumn: 1,
        endColumn: 4,
      }),
    };
    const mockPosition = { lineNumber: 1, column: 4 };

    const { suggestions } = provider.provideCompletionItems(
      mockModel,
      mockPosition
    );

    for (const suggestion of suggestions) {
      expect(suggestion).toHaveProperty("label");
      expect(suggestion).toHaveProperty("kind", 1);
      expect(suggestion).toHaveProperty("insertText");
      expect(suggestion).toHaveProperty("detail");
      expect(suggestion).toHaveProperty("documentation");
      expect(suggestion).toHaveProperty("range");
      expect(suggestion.label).toBe(suggestion.insertText);
    }
  });

  it("includes common PHP functions", () => {
    registerPhpCompletions(mockMonaco as never);

    const provider =
      mockMonaco.languages.registerCompletionItemProvider.mock.calls[0][1];

    const mockModel = {
      getWordUntilPosition: vi.fn().mockReturnValue({
        startColumn: 1,
        endColumn: 4,
      }),
    };
    const mockPosition = { lineNumber: 1, column: 4 };

    const { suggestions } = provider.provideCompletionItems(
      mockModel,
      mockPosition
    );

    const labels = suggestions.map((s: { label: string }) => s.label);

    expect(labels).toContain("strlen");
    expect(labels).toContain("array_map");
    expect(labels).toContain("json_encode");
    expect(labels).toContain("preg_match");
    expect(labels).toContain("file_get_contents");
    expect(labels).toContain("isset");
    expect(labels).toContain("echo");
    expect(labels).toContain("date");
    expect(labels).toContain("abs");
  });

  it("has no duplicate labels", () => {
    registerPhpCompletions(mockMonaco as never);

    const provider =
      mockMonaco.languages.registerCompletionItemProvider.mock.calls[0][1];

    const mockModel = {
      getWordUntilPosition: vi.fn().mockReturnValue({
        startColumn: 1,
        endColumn: 4,
      }),
    };
    const mockPosition = { lineNumber: 1, column: 4 };

    const { suggestions } = provider.provideCompletionItems(
      mockModel,
      mockPosition
    );

    const labels = suggestions.map((s: { label: string }) => s.label);
    const uniqueLabels = new Set(labels);

    expect(labels.length).toBe(uniqueLabels.size);
  });
});

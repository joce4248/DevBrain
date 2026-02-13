"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import { MONACO_LANGUAGE_MAP } from "@/lib/constants";

const Editor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-md" />,
});

interface SnippetCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export function SnippetCodeEditor({
  value,
  onChange,
  language,
}: SnippetCodeEditorProps) {
  const { theme } = useTheme();

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <Editor
        height="400px"
        language={MONACO_LANGUAGE_MAP[language] || "plaintext"}
        value={value}
        onChange={(val) => onChange(val || "")}
        theme={theme === "dark" ? "vs-dark" : "vs"}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "var(--font-mono), JetBrains Mono, monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          padding: { top: 12, bottom: 12 },
          automaticLayout: true,
          renderLineHighlight: "none",
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />
    </div>
  );
}

import type { Monaco } from "@monaco-editor/react";
import { registerPhpCompletions } from "./php";

let registered = false;

export function registerLanguageCompletions(monaco: Monaco): void {
  if (registered) return;
  registered = true;

  registerPhpCompletions(monaco);
}

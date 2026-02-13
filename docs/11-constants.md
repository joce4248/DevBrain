# 11 - Constantes

## Fichier source

`src/lib/constants.ts`

## Langages supportes

### `SUPPORTED_LANGUAGES`

Array constant (`as const`) de 26 langages :

```typescript
export const SUPPORTED_LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "rust",
  "go",
  "java",
  "csharp",
  "cpp",
  "c",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "dart",
  "sql",
  "html",
  "css",
  "scss",
  "json",
  "yaml",
  "toml",
  "markdown",
  "bash",
  "dockerfile",
  "graphql",
  "plaintext",
] as const;
```

### Type derive

```typescript
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
```

### `LANGUAGE_DISPLAY_NAMES`

Record mappant chaque cle de langage vers son nom d'affichage :

```typescript
export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  python: "Python",
  rust: "Rust",
  go: "Go",
  java: "Java",
  csharp: "C#",
  cpp: "C++",
  c: "C",
  ruby: "Ruby",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  dart: "Dart",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  yaml: "YAML",
  toml: "TOML",
  markdown: "Markdown",
  bash: "Bash",
  dockerfile: "Dockerfile",
  graphql: "GraphQL",
  plaintext: "Plain Text",
};
```

### `MONACO_LANGUAGE_MAP`

Record mappant chaque cle de langage vers l'identifiant Monaco correspondant :

```typescript
export const MONACO_LANGUAGE_MAP: Record<string, string> = {
  typescript: "typescript",
  javascript: "javascript",
  python: "python",
  rust: "rust",
  go: "go",
  java: "java",
  csharp: "csharp",
  cpp: "cpp",
  c: "c",
  ruby: "ruby",
  php: "php",
  swift: "swift",
  kotlin: "kotlin",
  dart: "dart",
  sql: "sql",
  html: "html",
  css: "css",
  scss: "scss",
  json: "json",
  yaml: "yaml",
  toml: "ini",           // Monaco n'a pas de mode "toml", utilise "ini"
  markdown: "markdown",
  bash: "shell",          // Monaco utilise "shell" pour bash
  dockerfile: "dockerfile",
  graphql: "graphql",
  plaintext: "plaintext",
};
```

**Cas speciaux** :
- `toml` → `"ini"` (Monaco n'a pas de mode TOML natif)
- `bash` → `"shell"` (Monaco utilise "shell")

## Couleurs des tags

### `TAG_COLORS`

Array constant de 11 couleurs hexadecimales :

```typescript
export const TAG_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#64748b", // slate
] as const;
```

La couleur par defaut lors de la creation d'un tag est `TAG_COLORS[0]` (`"#6366f1"`, indigo).

## Utilitaire `cn()`

Fichier : `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Combine `clsx` (classes conditionnelles) et `tailwind-merge` (resolution des conflits Tailwind). Utilise dans quasiment tous les composants.

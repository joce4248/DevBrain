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

## Autocompletion Monaco par langage

Fichiers : `src/lib/monaco-completions/`

Le systeme d'autocompletion utilise `monaco.languages.registerCompletionItemProvider()` pour enregistrer des providers de completion personnalises pour les langages qui n'ont pas d'autocompletion native dans Monaco.

### Point d'entree : `src/lib/monaco-completions/index.ts`

Exporte `registerLanguageCompletions(monaco: Monaco)` qui enregistre tous les providers. Un flag module-level `registered` empeche les appels multiples.

### PHP : `src/lib/monaco-completions/php.ts`

Exporte `registerPhpCompletions(monaco: Monaco)` qui enregistre un provider de completion pour le langage `"php"`.

Contient ~180 fonctions built-in PHP organisees par categorie :
- **String** (30+) : `strlen`, `strpos`, `str_replace`, `substr`, `explode`, `implode`, `trim`, `htmlspecialchars`, `sprintf`, etc.
- **Array** (35+) : `array_push`, `array_pop`, `array_map`, `array_filter`, `array_merge`, `count`, `in_array`, `sort`, etc.
- **Math** (16) : `abs`, `ceil`, `floor`, `round`, `max`, `min`, `rand`, `random_int`, etc.
- **Date/Time** (11) : `date`, `time`, `strtotime`, `date_create`, `date_format`, etc.
- **File** (25) : `fopen`, `fclose`, `file_get_contents`, `file_put_contents`, `file_exists`, `mkdir`, etc.
- **Type** (19) : `isset`, `empty`, `is_array`, `is_string`, `intval`, `strval`, `gettype`, etc.
- **JSON** (4) : `json_encode`, `json_decode`, `json_last_error`, `json_last_error_msg`
- **Regex** (6) : `preg_match`, `preg_match_all`, `preg_replace`, `preg_split`, etc.
- **Output** (6) : `echo`, `print`, `var_dump`, `print_r`, `header`, `http_response_code`
- **Misc** (14) : `die`, `exit`, `sleep`, `class_exists`, `password_hash`, `password_verify`, etc.

Chaque entree contient :
```typescript
{
  label: string;       // Nom de la fonction (ex: "strlen")
  detail: string;      // Signature simplifiee (ex: "strlen(string $string): int")
  documentation: string; // Description courte (ex: "Returns the length of a string.")
}
```

Le provider peut etre etendu pour d'autres langages en ajoutant un fichier par langage et en l'enregistrant dans `index.ts`.

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

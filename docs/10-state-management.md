# 10 - Gestion d'etat

## Vue d'ensemble

L'application utilise deux systemes de gestion d'etat complementaires :
- **Zustand** pour l'etat client (UI, editeur)
- **TanStack React Query** pour l'etat serveur (donnees Supabase)

## Zustand Stores

### UI Store

Fichier : `src/stores/ui-store.ts`

```typescript
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
```

**Valeurs initiales** :
- `filters`: `{ search: "", language: null, tagIds: [] }`
- `viewMode`: `"grid"`
- `sidebarOpen`: `false`
- `commandMenuOpen`: `false`

**Comportements notables** :
- `setLanguageFilter` : toggle (si meme langage → `null`, sinon → langage)
- `toggleTagFilter` : toggle (ajoute si absent, retire si present)
- `clearFilters` : reset a `initialFilters`

**Consomme par** : TopBar, CommandMenu, SidebarNav, SidebarTags, SidebarLanguages, MobileSidebar, pages (All Snippets, Favorites, Trash)

### Editor Store

Fichier : `src/stores/editor-store.ts`

```typescript
interface EditorState {
  isDirty: boolean;
  language: string;

  setIsDirty: (dirty: boolean) => void;
  setLanguage: (language: string) => void;
  reset: () => void;
}
```

**Valeurs initiales** :
- `isDirty`: `false`
- `language`: `"typescript"`

**`reset()`** : remet `isDirty: false, language: "typescript"`

**Consomme par** : `SnippetEditor`

## React Query

### Configuration globale

Fichier : `src/providers/query-provider.tsx`

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,         // 60 secondes
      refetchOnWindowFocus: false,    // Pas de refetch au focus
    },
  },
})
```

Le `QueryClient` est instancie dans un `useState` pour eviter la recreation a chaque rendu.

### Query Keys

| Key | Hook | Description |
|---|---|---|
| `["snippets"]` | — | Prefixe (via `snippetKeys()`) pour invalidation globale |
| `["snippets", view, filters]` | `useSnippets(view, filters)` | Liste filtree de snippets |
| `["snippet", id]` | `useSnippet(id)` | Snippet individuel avec tags |
| `["tags"]` | `useTags()` | Liste de tous les tags utilisateur |

### Strategie d'invalidation

| Mutation | Keys invalidees |
|---|---|
| `useCreateSnippet` | `["snippets"]` |
| `useUpdateSnippet` | `["snippets"]` + `["snippet", id]` |
| `useSoftDeleteSnippet` | `["snippets"]` |
| `useRestoreSnippet` | `["snippets"]` |
| `usePermanentDeleteSnippet` | `["snippets"]` |
| `useToggleFavorite` | `["snippets"]` + `["snippet", id]` |
| `useCreateTag` | `["tags"]` |
| `useDeleteTag` | `["tags"]` + `["snippets"]` |

L'invalidation de `["snippets"]` (sans parametres supplementaires) invalide **toutes** les queries dont la key commence par `["snippets"]`, couvrant ainsi toutes les vues et filtres.

### Pattern d'utilisation

Les hooks React Query sont toujours utilises dans des composants client (`"use client"`). Le client Supabase navigateur est instancie **une seule fois** en haut de chaque module de hook :

```typescript
const supabase = createClient();
```

Les mutations utilisent `useMutation` avec un callback `onSuccess` qui appelle `queryClient.invalidateQueries()`.

## Hooks personnalises

### `use-debounce.ts`

Hook generique de debounce. Retourne la valeur apres un delai.

```typescript
export function useDebounce<T>(value: T, delay: number): T
```

Utilise avec un delai de **200ms** dans le CommandMenu.

### `use-copy-clipboard.ts`

Hook pour copier du texte dans le presse-papier.

```typescript
export function useCopyClipboard(timeout = 2000): {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
}
```

- `timeout` defaut : 2000ms
- Utilise `navigator.clipboard.writeText()`
- `copied` repasse a `false` apres le timeout

### `use-keyboard-shortcuts.ts`

Enregistre `Cmd+K` / `Ctrl+K` pour ouvrir la command menu via `setCommandMenuOpen(true)`.

```typescript
export function useKeyboardShortcuts(): void
```

Appele dans `TopBar`.

# 07 - Recherche et filtres

## Vue d'ensemble

L'application offre un systeme de filtrage a 3 dimensions : recherche textuelle, filtre par langage, et filtre par tags. Les filtres sont stockes dans le store Zustand `ui-store` et consommes par les hooks React Query.

## Fichiers concernes

| Fichier | Role |
|---|---|
| `src/stores/ui-store.ts` | Store des filtres |
| `src/hooks/use-snippets.ts` | Application des filtres dans les requetes |
| `src/hooks/use-debounce.ts` | Hook debounce |
| `src/components/layout/sidebar-languages.tsx` | Filtre par langage |
| `src/components/layout/sidebar-tags.tsx` | Filtre par tags |
| `src/components/layout/command-menu.tsx` | Recherche via palette de commandes |
| `src/components/layout/top-bar.tsx` | Barre de recherche declenchant la command menu |

## Type FilterState

```typescript
interface FilterState {
  search: string;
  language: string | null;
  tagIds: string[];
}
```

Valeur initiale :
```typescript
const initialFilters: FilterState = {
  search: "",
  language: null,
  tagIds: [],
};
```

## Actions du store UI

### `setSearch(search: string)`

Met a jour `filters.search`.

### `setLanguageFilter(language: string | null)`

Toggle : si le langage clique est deja le filtre actif, le desactive (met a `null`). Sinon, l'active.

```typescript
language: state.filters.language === language ? null : language
```

### `toggleTagFilter(tagId: string)`

Toggle : si le tag est deja dans `tagIds`, le retire. Sinon, l'ajoute.

### `clearFilters()`

Reset tous les filtres a `initialFilters`.

## Application des filtres dans les requetes

Dans `fetchSnippetsWithTags` (`src/hooks/use-snippets.ts`) :

### 1. Filtre par vue

```typescript
if (view === "trash") {
  query = query.not("deleted_at", "is", null);
} else {
  query = query.is("deleted_at", null);
  if (view === "favorites") {
    query = query.eq("is_favorite", true);
  }
}
```

### 2. Filtre par langage

```typescript
if (filters.language) {
  query = query.eq("language", filters.language);
}
```

### 3. Filtre par recherche textuelle

**Sanitization** : les caracteres speciaux PostgREST sont supprimes avant la requete :
```typescript
const sanitized = filters.search.replace(/[%_\\,.()"']/g, "");
```

Caracteres supprimes : `%`, `_`, `\`, `,`, `.`, `(`, `)`, `"`, `'`

Si le texte sanitize n'est pas vide :
```typescript
query = query.or(
  `title.ilike.%${sanitized}%,content.ilike.%${sanitized}%,description.ilike.%${sanitized}%`
);
```

Recherche insensible a la casse (`ilike`) sur 3 champs : `title`, `content`, `description`.

### 4. Tri

```typescript
query = query.order("updated_at", { ascending: false });
```

Toujours trie par date de modification decroissante.

### 5. Filtre par tags (cote client)

Apres avoir recupere et assemble les snippets avec leurs tags, le filtre par tags est applique cote client :

```typescript
if (filters.tagIds.length > 0) {
  result = result.filter((s) =>
    filters.tagIds.every((tid) => s.tags.some((t) => t.id === tid))
  );
}
```

Logique **AND** : le snippet doit avoir **tous** les tags selectionnes.

## Hook useDebounce

Fichier : `src/hooks/use-debounce.ts`

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

Utilise dans `CommandMenu` avec un delai de **200ms**.

## Sidebar Languages

Fichier : `src/components/layout/sidebar-languages.tsx`

- Affiche tous les langages de `SUPPORTED_LANGUAGES`
- Chaque langage est un `<button>` qui appelle `setLanguageFilter(lang)`
- Si actif (`filters.language === lang`) : fond `bg-accent` + icone X
- Icone `FileCode` pour chaque langage

## Command Menu (palette de commandes)

Fichier : `src/components/layout/command-menu.tsx`

Ouverte via `Cmd+K` (ou clic sur la barre de recherche dans TopBar).

- Utilise le composant `cmdk` (`CommandDialog`)
- **Recherche en temps reel** : debounce de 200ms, appelle `useSnippets("all", { search: debouncedSearch, language: null, tagIds: [] })`
- **Section Snippets** : affiche les 8 premiers resultats. Clic → navigation vers `/snippets/${id}`
- **Section Actions** :
  - New Snippet → `/snippets/new`
  - All Snippets → `/`
  - Favorites → `/favorites`
  - Trash → `/trash`
- Reset du champ de recherche a la fermeture

## TopBar

Fichier : `src/components/layout/top-bar.tsx`

- Bouton hamburger (Menu icon, `md:hidden`) pour ouvrir la sidebar mobile
- Barre de recherche cliquable qui ouvre la command menu. Affiche le raccourci clavier `⌘K`
- Cote droit : ThemeToggle + UserMenu
- Initialise `useKeyboardShortcuts()` (Cmd+K)

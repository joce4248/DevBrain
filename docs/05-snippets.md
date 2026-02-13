# 05 - Gestion des snippets

## Vue d'ensemble

Les snippets sont le coeur de l'application. Un snippet est un extrait de code avec un titre, une description optionnelle, un langage, des tags, et un statut (actif, favori, supprime).

## Fichiers concernes

| Fichier | Role |
|---|---|
| `src/hooks/use-snippets.ts` | Hooks React Query pour CRUD + queries |
| `src/components/snippets/snippet-editor.tsx` | Editeur complet (creation + edition) |
| `src/components/snippets/snippet-code-editor.tsx` | Editeur Monaco |
| `src/components/snippets/snippet-meta-form.tsx` | Formulaire metadata |
| `src/components/snippets/snippet-card.tsx` | Carte snippet |
| `src/components/snippets/snippet-grid.tsx` | Grille de cartes |
| `src/components/snippets/snippet-empty-state.tsx` | Etats vides |
| `src/components/snippets/snippet-card-skeleton.tsx` | Skeleton de chargement |
| `src/components/snippets/copy-button.tsx` | Bouton copier |
| `src/components/snippets/delete-dialog.tsx` | Dialog suppression permanente |
| `src/components/snippets/language-badge.tsx` | Badge langage |
| `src/components/snippets/tag-badge.tsx` | Badge tag |
| `src/app/(main)/page.tsx` | Page tous les snippets |
| `src/app/(main)/favorites/page.tsx` | Page favoris |
| `src/app/(main)/trash/page.tsx` | Page corbeille |
| `src/app/(main)/snippets/new/page.tsx` | Page nouveau snippet |
| `src/app/(main)/snippets/[id]/page.tsx` | Page edition snippet |

## Types

Definis dans `src/types/index.ts` :

```typescript
interface Snippet {
  id: string;
  title: string;
  content: string;
  description: string | null;
  language: string;
  is_favorite: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface SnippetWithTags extends Snippet {
  tags: Tag[];
}

interface CreateSnippetInput {
  title: string;
  content: string;
  description?: string;
  language: string;
  tagIds?: string[];
}

interface UpdateSnippetInput {
  id: string;
  title?: string;
  content?: string;
  description?: string;
  language?: string;
  tagIds?: string[];
}

type SnippetView = "all" | "favorites" | "trash";
```

## Hooks React Query

Fichier : `src/hooks/use-snippets.ts`

Le client Supabase est instancie une seule fois en haut du module : `const supabase = createClient()`.

### `useSnippets(view, filters)`

- **Query key** : `["snippets", view, filters]`
- **Parametres** : `view: "all" | "favorites" | "trash"`, `filters: FilterState`
- **Logique de fetch** (`fetchSnippetsWithTags`) :
  1. Requete base : `supabase.from("snippets").select("*")`
  2. Filtrage par vue :
     - `trash` : `.not("deleted_at", "is", null)`
     - autres : `.is("deleted_at", null)` + si `favorites` : `.eq("is_favorite", true)`
  3. Filtre langage : `.eq("language", filters.language)` si present
  4. Filtre recherche : sanitize le texte (supprime `%_\,.()"'`), puis `.or("title.ilike.%...%,content.ilike.%...%,description.ilike.%...%")`
  5. Tri : `.order("updated_at", { ascending: false })`
  6. Recupere les `snippet_tags` pour les snippet IDs retournes
  7. Recupere les `tags` correspondants
  8. Assemble `SnippetWithTags[]` en mappant les tags sur chaque snippet
  9. Filtre cote client par `tagIds` : chaque tag filtre doit etre present dans le snippet (`every`)

### `useSnippet(id)`

- **Query key** : `["snippet", id]`
- **enabled** : `!!id`
- Recupere un snippet unique via `.eq("id", id).single()`
- Recupere ses tags via la table `snippet_tags` puis `tags`
- Retourne un `SnippetWithTags`

### `useCreateSnippet()`

- **Mutation**
- Verifie l'authentification via `supabase.auth.getUser()`
- Insere le snippet avec `user_id: user.id`
- Si `tagIds` fournis, insere les relations dans `snippet_tags`
- **onSuccess** : invalide `["snippets"]`
- Retourne `{ id: string }`

### `useUpdateSnippet()`

- **Mutation**
- Met a jour les champs modifies dans `snippets`
- Si `tagIds !== undefined` : supprime toutes les relations existantes dans `snippet_tags`, puis insere les nouvelles
- **onSuccess** : invalide `["snippets"]` ET `["snippet", variables.id]`

### `useSoftDeleteSnippet()`

- **Mutation**
- Set `deleted_at` a `new Date().toISOString()`
- **onSuccess** : invalide `["snippets"]`

### `useRestoreSnippet()`

- **Mutation**
- Set `deleted_at` a `null`
- **onSuccess** : invalide `["snippets"]`

### `usePermanentDeleteSnippet()`

- **Mutation**
- Supprime definitivement via `.delete().eq("id", id)`
- **onSuccess** : invalide `["snippets"]`

### `useToggleFavorite()`

- **Mutation**
- Parametre : `{ id: string, is_favorite: boolean }`
- Met a jour `is_favorite`
- **onSuccess** : invalide `["snippets"]` ET `["snippet", variables.id]`

### Fonction utilitaire `snippetKeys()`

Retourne `["snippets"] as const` — utilisee comme prefixe pour les invalidations.

## Composant SnippetEditor

Fichier : `src/components/snippets/snippet-editor.tsx`

Props : `{ snippet?: SnippetWithTags }` — si present = mode edition, sinon = mode creation.

**Etat local** :
- `title`, `description`, `language` (defaut: `"typescript"`), `content`, `selectedTagIds`

**Comportement** :
- Chaque modification appelle `markDirty()` via le store `editor-store`
- `useEffect` synchronise l'etat local quand `snippet` change
- **handleSave** :
  - Validation : `title` et `content` requis (sinon toast erreur)
  - Mode edition : `updateSnippet.mutateAsync({...})`
  - Mode creation : `createSnippet.mutateAsync({...})` puis navigation vers `/snippets/${created.id}`
  - Succes : toast "Snippet updated" / "Snippet created", reset dirty
  - Erreur : toast "Failed to save snippet"

**Layout** : grille responsive `lg:grid-cols-[1fr_1.5fr]` avec SnippetMetaForm a gauche et SnippetCodeEditor a droite.

**Header** : bouton retour (ArrowLeft), titre "Edit Snippet" / "New Snippet", bouton Save (avec icone Save).

## Composant SnippetCodeEditor

Fichier : `src/components/snippets/snippet-code-editor.tsx`

- Charge Monaco Editor dynamiquement via `next/dynamic` avec `ssr: false`
- Loading fallback : `<Skeleton className="h-[400px] w-full rounded-md" />`
- Theme Monaco : `theme === "dark" ? "vs-dark" : "vs"`
- Langage : mappe via `MONACO_LANGUAGE_MAP` (fallback: `"plaintext"`)
- **Options Monaco** :
  ```javascript
  {
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
    scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
  }
  ```

## Composant SnippetMetaForm

Fichier : `src/components/snippets/snippet-meta-form.tsx`

Props :
```typescript
{
  title: string;
  description: string;
  language: string;
  selectedTagIds: string[];
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onLanguageChange: (language: string) => void;
  onTagToggle: (tagId: string) => void;
}
```

Champs :
1. **Title** : `<Input>` avec placeholder "Snippet title"
2. **Description** : `<Textarea>` avec placeholder "Optional description...", `rows={2}`, `resize-none`
3. **Language** : `<Select>` avec les `SUPPORTED_LANGUAGES`, affichage via `LANGUAGE_DISPLAY_NAMES`
4. **Tags** : liste de `<Badge>` cliquables. Si selectionne : fond colore + icone X. Si non selectionne : outline colore. Si aucun tag : message "No tags created yet. Add them from the sidebar."

## Composant SnippetCard

Fichier : `src/components/snippets/snippet-card.tsx`

Props : `{ snippet: SnippetWithTags; view: SnippetView; onDelete?: (id: string) => void }`

**Apercu du code** : 5 premieres lignes du contenu (`snippet.content.split("\n").slice(0, 5).join("\n")`).

**Actions (visibles au hover, `opacity-0 → group-hover:opacity-100`)** :
- **Vue normale** (all/favorites) :
  - CopyButton : copier le code
  - Favori : toggle via `useToggleFavorite` (Heart icon, rouge si favori)
  - Supprimer : soft delete via `useSoftDeleteSnippet` (Trash2 icon)
- **Vue corbeille** :
  - Restaurer : via `useRestoreSnippet` (RotateCcw icon)
  - Supprimer definitivement : appelle `onDelete(snippet.id)` (Trash2 icon en `text-destructive`)

**Lien** : clique sur la carte navigue vers `/snippets/${snippet.id}` (sauf en mode trash → `#`).

**Pied de carte** : `LanguageBadge` + `TagBadge` pour chaque tag + Heart icon si favori (hors trash).

## Composant SnippetGrid

Fichier : `src/components/snippets/snippet-grid.tsx`

Props : `{ snippets: SnippetWithTags[]; isLoading: boolean; view: SnippetView; onDelete?: (id: string) => void }`

- **Loading** : affiche 6 `SnippetCardSkeleton` dans une grille `sm:grid-cols-2 lg:grid-cols-3`
- **Vide** : affiche `SnippetEmptyState` avec le `view` courant
- **Donnees** : grille de `SnippetCard` avec les memes breakpoints

## Composant SnippetEmptyState

Fichier : `src/components/snippets/snippet-empty-state.tsx`

3 etats selon la vue :
- `all` : icone Code2, "No snippets yet", "Create your first code snippet to get started." + bouton "New Snippet" → `/snippets/new`
- `favorites` : icone Heart, "No favorites yet", "Star snippets to add them to your favorites."
- `trash` : icone Trash2, "Trash is empty", "Deleted snippets will appear here."

## Composant DeleteDialog

Fichier : `src/components/snippets/delete-dialog.tsx`

Props : `{ open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; isPending?: boolean }`

Dialog Radix avec titre "Delete permanently?", description "This action cannot be undone...", boutons Cancel (ghost) et Delete (destructive, disabled si isPending).

## Composant CopyButton

Fichier : `src/components/snippets/copy-button.tsx`

Utilise le hook `useCopyClipboard`. Affiche Check (vert) apres copie, Copy sinon. Tooltip "Copied!" / "Copy code".

## Composant LanguageBadge

Fichier : `src/components/snippets/language-badge.tsx`

`<Badge variant="secondary" className="font-mono text-[10px]">` avec le nom d'affichage du langage.

## Composant TagBadge

Fichier : `src/components/snippets/tag-badge.tsx`

`<Badge variant="outline" className="text-[10px]">` avec `borderColor` et `color` = `tag.color`.

## Pages

### Page All Snippets (`src/app/(main)/page.tsx`)

- Lit `filters` depuis `useUIStore`
- Appelle `useSnippets("all", filters)`
- Titre : "All Snippets", sous-titre : "Browse and manage your code snippets"
- Affiche `<SnippetGrid snippets={snippets || []} isLoading={isLoading} view="all" />`
- Classe : `animate-fade-in`

### Page Favorites (`src/app/(main)/favorites/page.tsx`)

Identique a All Snippets avec `view="favorites"`.
- Titre : "Favorites", sous-titre : "Your starred code snippets"

### Page Trash (`src/app/(main)/trash/page.tsx`)

- Ajoute la gestion de suppression permanente
- Etat local `deleteId` (string | null) pour le snippet a supprimer
- Utilise `usePermanentDeleteSnippet`
- Passe `onDelete={setDeleteId}` a SnippetGrid
- Affiche `<DeleteDialog>` avec confirmation
- Toast succes "Snippet permanently deleted" / erreur "Failed to delete snippet"
- Titre : "Trash", sous-titre : "Deleted snippets. Restore or permanently delete."

### Page New Snippet (`src/app/(main)/snippets/new/page.tsx`)

Simplement `<SnippetEditor />` sans props (mode creation).

### Page Edit Snippet (`src/app/(main)/snippets/[id]/page.tsx`)

- Recoit `params: Promise<{ id: string }>`, utilise `use(params)` pour extraire `id`
- Appelle `useSnippet(id)`
- **Loading** : affiche un layout de skeletons
- **Not found** : "Snippet not found" + "This snippet may have been deleted."
- **Succes** : `<SnippetEditor snippet={snippet} />`

## Error Boundary

Fichier : `src/app/(main)/error.tsx`

Composant client qui affiche :
- Icone AlertCircle dans un cercle `bg-destructive/10`
- Titre "Something went wrong"
- Message d'erreur ou "An unexpected error occurred."
- Bouton "Try again" qui appelle `reset()`

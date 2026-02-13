# 06 - Gestion des tags

## Vue d'ensemble

Les tags permettent de categoriser les snippets. Chaque tag a un nom et une couleur. Un snippet peut avoir plusieurs tags (relation many-to-many via la table `snippet_tags`). Les tags sont filtres par utilisateur.

## Fichiers concernes

| Fichier | Role |
|---|---|
| `src/hooks/use-tags.ts` | Hooks React Query (fetch, create, delete) |
| `src/components/layout/sidebar-tags.tsx` | Section tags dans la sidebar |
| `src/components/snippets/snippet-meta-form.tsx` | Selection de tags dans l'editeur |
| `src/components/snippets/tag-badge.tsx` | Badge visuel tag |
| `src/types/index.ts` | Type `Tag`, `SnippetTag` |
| `src/lib/constants.ts` | `TAG_COLORS` |

## Type Tag

```typescript
interface Tag {
  id: string;
  name: string;
  color: string;   // Code hexadecimal (ex: "#6366f1")
  user_id: string;
}

interface SnippetTag {
  snippet_id: string;
  tag_id: string;
}
```

## Hooks React Query

Fichier : `src/hooks/use-tags.ts`

Client Supabase instancie en haut du module : `const supabase = createClient()`.

### `useTags()`

- **Query key** : `["tags"]`
- Requete : `supabase.from("tags").select("*").order("name")`
- Retourne `Tag[]` trie alphabetiquement

### `useCreateTag()`

- **Mutation**
- Parametre : `{ name: string; color: string }`
- Verifie l'authentification via `supabase.auth.getUser()`
- Insere : `{ name, color, user_id: user.id }`
- Utilise `.select().single()` pour retourner le tag cree
- **onSuccess** : invalide `["tags"]`

### `useDeleteTag()`

- **Mutation**
- Parametre : `id: string`
- Supprime via `supabase.from("tags").delete().eq("id", id)`
- **onSuccess** : invalide `["tags"]` ET `["snippets"]` (car les snippets affichent leurs tags)

## Sidebar Tags

Fichier : `src/components/layout/sidebar-tags.tsx`

Composant client qui affiche la liste des tags dans la sidebar avec un bouton "+" pour en creer.

### Creation de tag

Un `<Popover>` s'ouvre au clic sur le bouton "+". Contient :
1. **Input** : nom du tag (placeholder "Tag name"), soumission par Enter
2. **Selecteur de couleur** : grille de boutons ronds colores (les 11 `TAG_COLORS`). La couleur selectionnee a `scale-125` + `ring-2`
3. **Bouton "Create"** : appelle `createTag.mutate({ name, color })`
4. **onSuccess** : reset du nom et fermeture du popover

### Liste des tags

Chaque tag est un `<button>` cliquable qui appelle `toggleTagFilter(tag.id)`. Si actif (dans `filters.tagIds`) : fond `bg-accent` + icone X. L'icone Tag est coloree avec `tag.color`.

Si aucun tag : affiche "No tags yet".

## Assignation de tags aux snippets

La liaison tags-snippets se fait dans `src/hooks/use-snippets.ts` :

### A la creation (`useCreateSnippet`)

Apres insertion du snippet, si `tagIds` fournis :
```typescript
supabase.from("snippet_tags").insert(tagIds.map(tag_id => ({ snippet_id: snippet.id, tag_id })));
```

### A la mise a jour (`useUpdateSnippet`)

Strategie "delete-then-insert" :
1. Supprime toutes les relations existantes : `supabase.from("snippet_tags").delete().eq("snippet_id", id)`
2. Insere les nouvelles relations si `tagIds.length > 0`

### A la suppression d'un tag (`useDeleteTag`)

La suppression d'un tag dans la table `tags` entraine la suppression en cascade des relations `snippet_tags` correspondantes (geree par la foreign key en base).

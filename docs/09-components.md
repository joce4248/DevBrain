# 09 - Inventaire des composants

## Vue d'ensemble

Les composants sont organises en 3 dossiers sous `src/components/` :
- `ui/` : composants shadcn/ui generiques (16 fichiers)
- `layout/` : composants de structure de l'application (9 fichiers)
- `snippets/` : composants metier lies aux snippets (11 fichiers)

## Composants UI (shadcn/ui)

Tous ces composants viennent de la CLI shadcn avec le style **new-york** et la base color **slate**. Ils utilisent Radix UI sous le capot.

| Fichier | Composant(s) exporte(s) | Source Radix |
|---|---|---|
| `button.tsx` | `Button`, `buttonVariants` | — |
| `input.tsx` | `Input` | — |
| `textarea.tsx` | `Textarea` | — |
| `card.tsx` | `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent` | — |
| `badge.tsx` | `Badge`, `badgeVariants` | — |
| `dialog.tsx` | `Dialog`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogTitle`, `DialogTrigger` | `@radix-ui/react-dialog` |
| `tooltip.tsx` | `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` | `@radix-ui/react-tooltip` |
| `popover.tsx` | `Popover`, `PopoverContent`, `PopoverTrigger` | `@radix-ui/react-popover` |
| `select.tsx` | `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`, etc. | `@radix-ui/react-select` |
| `sheet.tsx` | `Sheet`, `SheetContent`, `SheetTrigger`, etc. | `@radix-ui/react-dialog` (variante) |
| `scroll-area.tsx` | `ScrollArea`, `ScrollBar` | `@radix-ui/react-scroll-area` |
| `separator.tsx` | `Separator` | `@radix-ui/react-separator` |
| `skeleton.tsx` | `Skeleton` | — |
| `command.tsx` | `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator` | `cmdk` |
| `toggle.tsx` | `Toggle`, `toggleVariants` | `@radix-ui/react-toggle` |
| `sonner.tsx` | `Toaster` | `sonner` |

## Composants Layout

### `sidebar.tsx`

- **Export** : `Sidebar`
- **Type** : Server Component (pas de `"use client"`)
- **Compose** : SidebarNav, SidebarTags, SidebarLanguages, UserMenu
- **Props** : aucune

### `sidebar-nav.tsx`

- **Export** : `SidebarNav`
- **Type** : Client Component
- **Hooks** : `usePathname()`
- **Props** : aucune
- **Constante locale** : `navItems` = `[{ label, href, icon }]` pour les 3 routes

### `sidebar-tags.tsx`

- **Export** : `SidebarTags`
- **Type** : Client Component
- **Hooks** : `useTags()`, `useCreateTag()`, `useUIStore`
- **Etat local** : `newTagName`, `selectedColor`, `popoverOpen`
- **Props** : aucune

### `sidebar-languages.tsx`

- **Export** : `SidebarLanguages`
- **Type** : Client Component
- **Hooks** : `useUIStore`
- **Props** : aucune

### `top-bar.tsx`

- **Export** : `TopBar`
- **Type** : Client Component
- **Hooks** : `useUIStore`, `useKeyboardShortcuts()`
- **Props** : aucune

### `user-menu.tsx`

- **Export** : `UserMenu`
- **Type** : Client Component
- **Hooks** : `useState`, `useEffect`, `useQueryClient`
- **Etat local** : `user: SupabaseUser | null`
- **Props** : aucune

### `mobile-sidebar.tsx`

- **Export** : `MobileSidebar`
- **Type** : Client Component
- **Hooks** : `useUIStore`
- **Props** : aucune

### `theme-toggle.tsx`

- **Export** : `ThemeToggle`
- **Type** : Client Component
- **Hooks** : `useTheme()`
- **Props** : aucune

### `command-menu.tsx`

- **Export** : `CommandMenu`
- **Type** : Client Component
- **Hooks** : `useRouter`, `useUIStore`, `useSnippets`, `useDebounce`, `useState`, `useEffect`
- **Etat local** : `search`
- **Props** : aucune

## Composants Snippets

### `snippet-editor.tsx`

- **Export** : `SnippetEditor`
- **Type** : Client Component
- **Props** : `{ snippet?: SnippetWithTags }`
- **Hooks** : `useRouter`, `useCreateSnippet`, `useUpdateSnippet`, `useEditorStore`
- **Etat local** : `title`, `description`, `language`, `content`, `selectedTagIds`

### `snippet-code-editor.tsx`

- **Export** : `SnippetCodeEditor`
- **Type** : Client Component
- **Props** : `{ value: string; onChange: (value: string) => void; language: string }`
- **Hooks** : `useTheme()`
- **Import dynamique** : Monaco Editor (`ssr: false`)
- **beforeMount** : appelle `registerLanguageCompletions(monaco)` pour enregistrer les providers d'autocompletion (PHP)

### `snippet-meta-form.tsx`

- **Export** : `SnippetMetaForm`
- **Type** : Client Component
- **Props** :
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
- **Hooks** : `useTags()`

### `snippet-card.tsx`

- **Export** : `SnippetCard`
- **Type** : Client Component
- **Props** : `{ snippet: SnippetWithTags; view: SnippetView; onDelete?: (id: string) => void }`
- **Hooks** : `useToggleFavorite`, `useSoftDeleteSnippet`, `useRestoreSnippet`

### `snippet-grid.tsx`

- **Export** : `SnippetGrid`
- **Type** : Client Component
- **Props** : `{ snippets: SnippetWithTags[]; isLoading: boolean; view: SnippetView; onDelete?: (id: string) => void }`

### `snippet-empty-state.tsx`

- **Export** : `SnippetEmptyState`
- **Type** : Server Component (pas de `"use client"`, import statique)
- **Props** : `{ view: SnippetView }`
- **Constante locale** : `emptyStates: Record<SnippetView, { icon, title, description }>`

### `snippet-card-skeleton.tsx`

- **Export** : `SnippetCardSkeleton`
- **Type** : Server Component
- **Props** : aucune

### `copy-button.tsx`

- **Export** : `CopyButton`
- **Type** : Client Component
- **Props** : `{ text: string; className?: string }`
- **Hooks** : `useCopyClipboard()`

### `delete-dialog.tsx`

- **Export** : `DeleteDialog`
- **Type** : Client Component
- **Props** : `{ open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; isPending?: boolean }`

### `language-badge.tsx`

- **Export** : `LanguageBadge`
- **Type** : Server Component
- **Props** : `{ language: string }`

### `tag-badge.tsx`

- **Export** : `TagBadge`
- **Type** : Server Component
- **Props** : `{ tag: Tag }`

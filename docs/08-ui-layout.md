# 08 - UI et Layout

## Vue d'ensemble

L'interface suit un layout classique "sidebar + topbar + contenu principal". Elle est responsive avec une sidebar desktop fixe et une sidebar mobile en Sheet. Le theming dark/light est gere par `next-themes`.

## Fichiers concernes

| Fichier | Role |
|---|---|
| `src/app/layout.tsx` | Root layout (providers, fonts, metadata) |
| `src/app/(main)/layout.tsx` | Layout principal (sidebar + topbar) |
| `src/app/(auth)/layout.tsx` | Layout auth (centrage) |
| `src/app/globals.css` | Variables CSS, animations, theme |
| `src/components/layout/sidebar.tsx` | Sidebar desktop |
| `src/components/layout/sidebar-nav.tsx` | Navigation sidebar |
| `src/components/layout/mobile-sidebar.tsx` | Sidebar mobile (Sheet) |
| `src/components/layout/top-bar.tsx` | Barre superieure |
| `src/components/layout/theme-toggle.tsx` | Toggle dark/light |
| `src/components/layout/user-menu.tsx` | Menu utilisateur |
| `src/components/layout/command-menu.tsx` | Palette de commandes |
| `src/providers/theme-provider.tsx` | Provider next-themes |

## Layout principal

Fichier : `src/app/(main)/layout.tsx`

Structure HTML :
```tsx
<div className="flex h-screen overflow-hidden">
  <Sidebar />              {/* Desktop uniquement (hidden md:flex) */}
  <MobileSidebar />         {/* Mobile uniquement (Sheet) */}
  <div className="flex flex-1 flex-col overflow-hidden">
    <TopBar />              {/* Barre superieure */}
    <main className="flex-1 overflow-y-auto p-6">
      {children}
    </main>
  </div>
  <CommandMenu />           {/* Palette de commandes (dialog) */}
</div>
```

## Sidebar desktop

Fichier : `src/components/layout/sidebar.tsx`

Structure :
- **Header** (h-14) : logo "DevBrain" ("Dev" en `text-primary`)
- **Corps** (ScrollArea) : `SidebarNav` → `Separator` → `SidebarTags` → `Separator` → `SidebarLanguages`
- **Footer** (border-t) : `UserMenu`
- Largeur : `w-64`
- Visibilite : `hidden md:flex md:flex-col`
- Style : `border-r border-border bg-sidebar`

### SidebarNav

Fichier : `src/components/layout/sidebar-nav.tsx`

Elements :
1. **Bouton "New Snippet"** : `<Button>` avec icone Plus, lien vers `/snippets/new`
2. **Navigation** (3 items) :
   - "All Snippets" → `/` (icone Code2)
   - "Favorites" → `/favorites` (icone Heart)
   - "Trash" → `/trash` (icone Trash2)

Detection de la route active via `usePathname()` :
- `/` : actif uniquement si `pathname === "/"`
- Autres : actif si `pathname.startsWith(item.href)`

Style actif : `bg-accent text-accent-foreground`
Style inactif : `text-muted-foreground hover:bg-accent/50 hover:text-foreground`

### SidebarTags

Voir `06-tags.md` pour les details.

### SidebarLanguages

Fichier : `src/components/layout/sidebar-languages.tsx`

Liste tous les `SUPPORTED_LANGUAGES` avec :
- Icone `FileCode` (h-3 w-3)
- Nom d'affichage via `LANGUAGE_DISPLAY_NAMES`
- Icone X si actif
- Toggle via `setLanguageFilter(lang)`

## Sidebar mobile

Fichier : `src/components/layout/mobile-sidebar.tsx`

Utilise le composant `Sheet` (Radix) cote gauche (`side="left"`).

- Controleur : `sidebarOpen` / `setSidebarOpen` depuis `ui-store`
- Largeur : `w-64`
- Contenu identique a la sidebar desktop : logo + SidebarNav + SidebarTags + SidebarLanguages
- Hauteur du scroll : `h-[calc(100vh-3.5rem)]`

## TopBar

Fichier : `src/components/layout/top-bar.tsx`

Structure :
```
[Hamburger (mobile)] [Barre de recherche]        [ThemeToggle] [UserMenu]
```

- **Hamburger** : `md:hidden`, toggle `setSidebarOpen(!sidebarOpen)`
- **Barre de recherche** : `<button>` stylise comme un input. Ouvre la command menu. Affiche `⌘K` (cache sur mobile `sm:inline-block`)
- **ThemeToggle + UserMenu** : aligne a droite (`ml-auto`)
- Appelle `useKeyboardShortcuts()` pour enregistrer Cmd+K
- Hauteur : `h-14`

## Theme Toggle

Fichier : `src/components/layout/theme-toggle.tsx`

- Utilise `useTheme()` de `next-themes`
- Toggle entre "dark" et "light" au clic
- **Icones animees** : Sun et Moon avec rotation/scale transitions
  - Sun : `rotate-0 scale-100` en light, `-rotate-90 scale-0` en dark
  - Moon : `rotate-90 scale-0` en light, `rotate-0 scale-100` en dark (position absolute)
- Tooltip "Toggle theme"
- `<span className="sr-only">Toggle theme</span>` pour l'accessibilite

## Theme Provider

Fichier : `src/providers/theme-provider.tsx`

```tsx
<NextThemesProvider
  attribute="class"        // Applique la classe "dark" sur <html>
  defaultTheme="dark"      // Theme par defaut
  enableSystem              // Respecte la preference systeme
  disableTransitionOnChange // Pas de transition au changement de theme
>
```

## Variables CSS et theming

Fichier : `src/app/globals.css`

### Imports
```css
@import "tailwindcss";
@import "shadcn/tailwind.css";
@custom-variant dark (&:is(.dark *));
```

### Animations personnalisees

```css
--animate-fade-in: fade-in 0.2s ease-out;
--animate-slide-in: slide-in 0.2s ease-out;

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in {
  from { opacity: 0; transform: translateX(-4px); }
  to { opacity: 1; transform: translateX(0); }
}
```

Utilisees via les classes `animate-fade-in` (sur les pages) et `animate-slide-in`.

### Radius

```css
--radius: 0.625rem;
```

Les variantes sont calculees : `--radius-sm` = radius - 4px, `--radius-md` = radius - 2px, etc.

### Palette de couleurs

Systeme oklch avec 2 themes complets (:root pour light, .dark pour dark).

**Couleurs principales (light / dark)** :

| Variable | Light | Dark |
|---|---|---|
| `--background` | `oklch(0.985 0.002 247)` | `oklch(0.129 0.042 264.695)` |
| `--foreground` | `oklch(0.129 0.042 264.695)` | `oklch(0.984 0.003 247.858)` |
| `--primary` | `oklch(0.457 0.24 277.023)` | `oklch(0.541 0.281 275.827)` |
| `--card` | `oklch(1 0 0)` | `oklch(0.175 0.042 264)` |
| `--muted` | `oklch(0.968 0.007 247.896)` | `oklch(0.279 0.041 260.031)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` |
| `--border` | `oklch(0.929 0.013 255.508)` | `oklch(1 0 0 / 10%)` |
| `--sidebar` | `oklch(0.975 0.005 247)` | `oklch(0.155 0.042 264)` |

### Layer base

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Raccourcis clavier

Fichier : `src/hooks/use-keyboard-shortcuts.ts`

Un seul raccourci : `Cmd+K` (ou `Ctrl+K`) ouvre la command menu.

```typescript
function handleKeyDown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    setCommandMenuOpen(true);
  }
}
```

Enregistre via `document.addEventListener("keydown", ...)` dans un `useEffect`, avec cleanup au demontage.

## Responsive design

| Breakpoint | Comportement |
|---|---|
| Mobile (< md) | Sidebar cachee, hamburger visible, sidebar mobile en Sheet |
| Desktop (>= md) | Sidebar fixe visible, hamburger cache |
| Grille snippets | 1 col < sm, 2 cols >= sm, 3 cols >= lg |
| Editeur | 1 col < lg, 2 cols >= lg (grid-cols-[1fr_1.5fr]) |
| Raccourci ⌘K | Cache < sm, visible >= sm |

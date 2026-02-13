# 00 - Vue d'ensemble

## Nom du projet

**DevBrain** - Un gestionnaire de snippets de code moderne pour les developpeurs.

## Description

DevBrain est une application web full-stack qui permet aux developpeurs de stocker, organiser et gerer leurs extraits de code (snippets). L'application offre un editeur de code avec coloration syntaxique, un systeme de tags, des favoris, une corbeille avec suppression douce, et une recherche avancee.

## Metadata

- **Nom du package** : `devbrain`
- **Version** : `0.1.0`
- **Private** : `true`
- **Titre HTML** : `DevBrain - Snippet Manager`
- **Meta description** : `A modern snippet manager for developers`

## Stack technique

### Frontend

| Technologie | Version | Role |
|---|---|---|
| Next.js | 16.1.6 | Framework React (App Router) |
| React | 19.2.3 | Bibliotheque UI |
| TypeScript | ^5 | Typage statique |
| Tailwind CSS | ^4 | Styling utility-first |
| shadcn/ui (new-york) | via `radix-ui ^1.4.3` | Composants UI pre-construits |
| Monaco Editor | ^4.7.0 (`@monaco-editor/react`) | Editeur de code |
| Zustand | ^5.0.11 | Gestion d'etat client |
| TanStack React Query | ^5.90.20 | Gestion d'etat serveur / cache |
| cmdk | ^1.1.1 | Palette de commandes |
| Lucide React | ^0.563.0 | Icones |
| next-themes | ^0.4.6 | Gestion theme dark/light |
| Sonner | ^2.0.7 | Notifications toast |
| clsx | ^2.1.1 | Utilitaire classes conditionnelles |
| tailwind-merge | ^3.4.0 | Fusion classes Tailwind |
| class-variance-authority | ^0.7.1 | Variantes de composants |

### Backend

| Technologie | Version | Role |
|---|---|---|
| Supabase | `@supabase/supabase-js ^2.95.3` | Base de donnees PostgreSQL + Auth |
| Supabase SSR | `@supabase/ssr ^0.8.0` | Client Supabase cote serveur |

### DevDependencies

| Technologie | Version | Role |
|---|---|---|
| `@tailwindcss/postcss` | ^4 | Integration PostCSS |
| `@testing-library/jest-dom` | ^6.9.1 | Matchers DOM pour tests |
| `@testing-library/react` | ^16.3.2 | Rendu hooks/composants pour tests |
| `@testing-library/user-event` | ^14.6.1 | Simulation interactions utilisateur |
| `@types/node` | ^20 | Types Node.js |
| `@types/react` | ^19 | Types React |
| `@types/react-dom` | ^19 | Types React DOM |
| ESLint | ^9 | Linter |
| `eslint-config-next` | 16.1.6 | Config ESLint Next.js |
| jsdom | ^28.0.0 | Environnement navigateur simule pour tests |
| shadcn CLI | ^3.8.4 | Generateur de composants |
| tailwindcss | ^4 | Moteur CSS |
| typescript | ^5 | Compilateur TypeScript |
| Vitest | ^4.0.18 | Test runner unitaire |

## Scripts npm

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

## Arborescence complete des fichiers source

```
src/
  app/
    layout.tsx                          # Layout racine (providers, fonts, metadata)
    globals.css                         # Styles globaux + variables CSS + animations
    (auth)/
      layout.tsx                        # Layout auth (centrage)
      login/page.tsx                    # Page de connexion
      signup/page.tsx                   # Page d'inscription
    auth/
      callback/route.ts                # Callback OAuth (GET)
    (main)/
      layout.tsx                        # Layout principal (sidebar + topbar + command menu)
      page.tsx                          # Page "All Snippets"
      error.tsx                         # Error boundary
      favorites/page.tsx                # Page favoris
      trash/page.tsx                    # Page corbeille
      snippets/
        new/page.tsx                    # Page creation snippet
        [id]/page.tsx                   # Page edition snippet
  components/
    ui/                                 # Composants shadcn/ui (16 fichiers)
      button.tsx, input.tsx, card.tsx, dialog.tsx,
      tooltip.tsx, skeleton.tsx, badge.tsx, select.tsx,
      scroll-area.tsx, separator.tsx, textarea.tsx,
      popover.tsx, sheet.tsx, command.tsx, toggle.tsx, sonner.tsx
    layout/                             # Composants de mise en page
      sidebar.tsx                       # Sidebar desktop
      sidebar-nav.tsx                   # Navigation principale sidebar
      sidebar-tags.tsx                  # Section tags sidebar
      sidebar-languages.tsx             # Section langages sidebar
      top-bar.tsx                       # Barre superieure
      user-menu.tsx                     # Menu utilisateur (popover)
      mobile-sidebar.tsx                # Sidebar mobile (sheet)
      theme-toggle.tsx                  # Toggle dark/light
      command-menu.tsx                  # Palette de commandes (Cmd+K)
    snippets/                           # Composants metier snippets
      snippet-editor.tsx                # Editeur complet (creation + edition)
      snippet-code-editor.tsx           # Editeur Monaco
      snippet-meta-form.tsx             # Formulaire metadata (titre, desc, lang, tags)
      snippet-card.tsx                  # Carte snippet dans la grille
      snippet-grid.tsx                  # Grille de snippets
      snippet-empty-state.tsx           # Etat vide par vue
      snippet-card-skeleton.tsx         # Skeleton de carte
      copy-button.tsx                   # Bouton copier le code
      delete-dialog.tsx                 # Dialog de suppression permanente
      language-badge.tsx                # Badge langage
      tag-badge.tsx                     # Badge tag
  hooks/
    use-snippets.ts                     # CRUD + queries snippets (React Query)
    use-tags.ts                         # CRUD tags (React Query)
    use-keyboard-shortcuts.ts           # Raccourci Cmd+K
    use-debounce.ts                     # Hook debounce generique
    use-copy-clipboard.ts              # Hook copier dans le presse-papier
    __tests__/
      use-snippets.test.ts             # Tests hooks snippets (15 tests)
      use-tags.test.ts                 # Tests hooks tags (6 tests)
      use-debounce.test.ts             # Tests hook debounce (5 tests)
      use-copy-clipboard.test.ts       # Tests hook clipboard (5 tests)
  stores/
    ui-store.ts                         # Store Zustand UI (filtres, sidebar, command menu)
    editor-store.ts                     # Store Zustand editeur (dirty, language)
    __tests__/
      ui-store.test.ts                 # Tests store UI (12 tests)
      editor-store.test.ts            # Tests store editeur (4 tests)
  lib/
    utils.ts                            # Fonction cn() (clsx + tailwind-merge)
    constants.ts                        # Langages, couleurs tags, mapping Monaco
    __tests__/
      utils.test.ts                    # Tests cn() (4 tests)
    supabase/
      client.ts                         # Client Supabase navigateur
      server.ts                         # Client Supabase serveur
      proxy.ts                          # Middleware Supabase (gestion session + redirections)
      types.ts                          # Types generes Supabase (Database)
      __tests__/
        proxy.test.ts                  # Tests middleware session (7 tests)
    auth/
      actions.ts                        # Server Actions auth (login, signup, OAuth, logout)
      __tests__/
        actions.test.ts                # Tests Server Actions auth (11 tests)
  test-utils/
    react-query.tsx                    # Wrapper QueryClient pour tests
    supabase-mock.ts                   # Factory mock Supabase
  providers/
    theme-provider.tsx                  # Provider next-themes
    query-provider.tsx                  # Provider React Query
  types/
    index.ts                            # Types metier TypeScript
  proxy.ts                              # Point d'entree middleware Next.js
```

## Fichiers racine

```
/
  package.json                          # Dependances et scripts
  tsconfig.json                         # Configuration TypeScript
  next.config.ts                        # Configuration Next.js (headers securite)
  vitest.config.ts                      # Configuration Vitest (globals, jsdom, alias, setup)
  vitest.setup.ts                       # Mocks globaux (Supabase, next/navigation, clipboard)
  postcss.config.mjs                    # Configuration PostCSS (@tailwindcss/postcss)
  components.json                       # Configuration shadcn/ui
  .env.example                          # Variables d'environnement requises
  .env.local                            # Variables d'environnement locales (non commite)
```

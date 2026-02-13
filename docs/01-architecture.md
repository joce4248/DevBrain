# 01 - Architecture

## Pattern general

L'application utilise le **Next.js App Router** avec une separation en route groups :
- `(auth)` : routes publiques d'authentification
- `(main)` : routes protegees de l'application principale

## Flux de donnees

```
Supabase PostgreSQL (base de donnees distante)
        |
        v
Supabase Client (browser) / Server Client (SSR)
        |
        v
React Query Hooks (useSnippets, useTags) — cache + mutations
        |
        v
Zustand Stores (ui-store, editor-store) — etat UI local
        |
        v
Composants React (rendu conditionnel selon l'etat)
        |
        v
Actions utilisateur → mutations React Query → invalidation cache → re-fetch
```

## Next.js App Router

### Route Groups

Les route groups `(auth)` et `(main)` partagent le meme root layout mais ont des layouts differents :

- **Root Layout** (`src/app/layout.tsx`) : fournit les providers (Theme, Query, Tooltip), les fonts, le Toaster
- **Auth Layout** (`src/app/(auth)/layout.tsx`) : centrage simple en plein ecran
- **Main Layout** (`src/app/(main)/layout.tsx`) : structure avec Sidebar + TopBar + CommandMenu

### Routes

| Route | Fichier | Description |
|---|---|---|
| `/login` | `src/app/(auth)/login/page.tsx` | Connexion |
| `/signup` | `src/app/(auth)/signup/page.tsx` | Inscription |
| `/auth/callback` | `src/app/auth/callback/route.ts` | Callback OAuth (GET) |
| `/` | `src/app/(main)/page.tsx` | Tous les snippets |
| `/favorites` | `src/app/(main)/favorites/page.tsx` | Favoris |
| `/trash` | `src/app/(main)/trash/page.tsx` | Corbeille |
| `/snippets/new` | `src/app/(main)/snippets/new/page.tsx` | Nouveau snippet |
| `/snippets/[id]` | `src/app/(main)/snippets/[id]/page.tsx` | Edition snippet |

### Middleware (proxy)

Le fichier `src/proxy.ts` sert de middleware Next.js. Il exporte une fonction `proxy` et un `config.matcher`.

**Matcher** : exclut les fichiers statiques (`_next/static`, `_next/image`, `favicon.ico`, images).

**Logique** (`src/lib/supabase/proxy.ts` - fonction `updateSession`) :
1. Cree un client Supabase serveur avec gestion des cookies (lecture depuis `request.cookies`, ecriture dans `response.cookies`)
2. Verifie l'authentification via `supabase.auth.getClaims()`
3. Si non authentifie ET route protegee → redirect `/login`
4. Si authentifie ET route auth (`/login`, `/signup`) → redirect `/`
5. Retourne la reponse avec les cookies mis a jour

## Providers (wrapping order)

L'ordre d'imbrication dans le root layout :

```tsx
<html>
  <body>
    <ThemeProvider>           // next-themes (attribute="class", defaultTheme="dark", enableSystem)
      <QueryProvider>         // React Query (staleTime: 60s, refetchOnWindowFocus: false)
        <TooltipProvider>     // Radix tooltip provider
          {children}
          <Toaster />         // Sonner toast container
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  </body>
</html>
```

## Gestion d'etat

### Client State — Zustand

Deux stores independants :

1. **`ui-store`** : filtres de recherche, mode de vue, sidebar, command menu
2. **`editor-store`** : etat dirty de l'editeur, langage selectionne

Details complets dans `10-state-management.md`.

### Server State — React Query

Configuration globale :
- `staleTime: 60 * 1000` (60 secondes)
- `refetchOnWindowFocus: false`

Query keys :
- `["snippets"]` : prefixe pour toutes les listes de snippets
- `["snippets", view, filters]` : liste filtree
- `["snippet", id]` : snippet individuel
- `["tags"]` : liste des tags

Strategie d'invalidation : apres chaque mutation, invalidation des queries concernees via `queryClient.invalidateQueries()`.

## Architecture des composants

### Organisation en 3 couches

1. **`components/ui/`** : composants shadcn/ui generiques (Button, Card, Input, etc.) — ne contiennent aucune logique metier
2. **`components/layout/`** : composants de structure (Sidebar, TopBar, CommandMenu) — consomment les stores Zustand
3. **`components/snippets/`** : composants metier specifiques aux snippets — consomment les hooks React Query

### Convention "use client"

Tous les composants qui utilisent des hooks React (useState, useEffect), des stores Zustand, ou React Query sont marques `"use client"`. Les composants purement presentationnels sans hooks cote client restent des Server Components implicites (ex: `LanguageBadge`, `TagBadge`, `SnippetCardSkeleton`, `SnippetEmptyState`, `Sidebar`).

## Configuration Next.js

Fichier : `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
};
```

## Configuration TypeScript

Fichier : `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "incremental": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

L'alias `@/*` mappe vers `./src/*`.

## Configuration shadcn/ui

Fichier : `components.json`

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

## Configuration PostCSS

Fichier : `postcss.config.mjs`

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

## Fonts

Deux Google Fonts chargees via `next/font/google` dans le root layout :

1. **Inter** : variable CSS `--font-sans`, subsets: `["latin"]`
2. **JetBrains Mono** : variable CSS `--font-mono`, subsets: `["latin"]`

Les variables sont appliquees via les classes CSS sur `<body>` : `font-sans antialiased`.

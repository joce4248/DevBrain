# 12 - Tests unitaires

## Stack de tests

| Outil | Version | Role |
|---|---|---|
| Vitest | ^4.0.18 | Test runner (natif TS/ESM, compatible Vite) |
| @testing-library/react | ^16.3.2 | Rendu de hooks (`renderHook`) et composants |
| @testing-library/jest-dom | ^6.9.1 | Matchers DOM supplementaires (`toBeInTheDocument`, etc.) |
| @testing-library/user-event | ^14.6.1 | Simulation d'interactions utilisateur |
| jsdom | ^28.0.0 | Environnement navigateur simule |

## Scripts npm

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

## Configuration

### `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/__tests__/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- **globals: true** : `describe`, `it`, `expect`, `vi` disponibles sans import (sauf si on prefere les imports explicites)
- **environment: jsdom** : simule le DOM pour les hooks React
- **setupFiles** : charge les mocks globaux avant chaque fichier de test
- **alias `@/*`** : miroir du `tsconfig.json` paths

### `vitest.setup.ts`

Mocks globaux configures :

| Module mocke | Raison |
|---|---|
| `navigator.clipboard` | `writeText` / `readText` pour `useCopyClipboard` |
| `next/navigation` | `redirect` (throw `NEXT_REDIRECT:`), `useRouter`, `usePathname` |
| `next/headers` | `cookies()` pour les Server Actions |
| `@/lib/supabase/client` | Client Supabase navigateur (singleton mock) |
| `@/lib/supabase/server` | Client Supabase serveur (`createServerSupabaseClient`) |

**Important** : Le mock du client Supabase navigateur est un **singleton**. L'objet retourne par `createClient()` est toujours le meme, ce qui permet aux hooks (qui appellent `createClient()` au niveau module) et aux tests de partager la meme instance.

## Utilitaires de test

### `src/test-utils/react-query.tsx`

Fournit un `QueryClientProvider` configure pour les tests :

```ts
import { createWrapper } from "@/test-utils/react-query";

const { result } = renderHook(() => useMyHook(), { wrapper: createWrapper() });
```

- `retry: false` : pas de retry automatique (echec immediat)
- `gcTime: Infinity` : pas de garbage collection pendant les tests

### `src/test-utils/supabase-mock.ts`

Deux utilitaires :

**`createSupabaseChain(result)`** : Cree un Proxy chainable simulant le query builder Supabase. Toutes les methodes (`.select()`, `.eq()`, `.order()`, etc.) sont chainables et resolvent vers `result` quand await.

```ts
mockSupabase.from.mockReturnValue(
  createSupabaseChain({ data: [{ id: "1", name: "tag" }], error: null })
);
```

**`getMockedSupabase()`** : Retourne le singleton du client Supabase mocke avec les types corrects.

```ts
const mockSupabase = getMockedSupabase();
mockSupabase.from.mockImplementation((table: string) => {
  if (table === "snippets") return createSupabaseChain({ data: [...], error: null });
  return createSupabaseChain({ data: [], error: null });
});
```

## Convention de placement des tests

Les tests sont places dans des dossiers `__tests__/` a cote des fichiers testes :

```
src/
  lib/
    __tests__/utils.test.ts          # teste lib/utils.ts
    auth/__tests__/actions.test.ts   # teste lib/auth/actions.ts
    supabase/__tests__/proxy.test.ts # teste lib/supabase/proxy.ts
  stores/
    __tests__/editor-store.test.ts   # teste stores/editor-store.ts
    __tests__/ui-store.test.ts       # teste stores/ui-store.ts
  hooks/
    __tests__/use-debounce.test.ts        # teste hooks/use-debounce.ts
    __tests__/use-copy-clipboard.test.ts  # teste hooks/use-copy-clipboard.ts
    __tests__/use-tags.test.ts            # teste hooks/use-tags.ts
    __tests__/use-snippets.test.ts        # teste hooks/use-snippets.ts
  test-utils/
    react-query.tsx                  # wrapper QueryClient pour tests
    supabase-mock.ts                 # factory mock Supabase
```

## Inventaire des tests

### `src/lib/__tests__/utils.test.ts` (4 tests)

| Test | Description |
|---|---|
| merges class names | `cn("px-2", "py-1")` → `"px-2 py-1"` |
| handles conditional classes | `cn("base", false && "hidden", "visible")` → `"base visible"` |
| deduplicates conflicting tailwind classes | `cn("px-2", "px-4")` → `"px-4"` |
| returns empty string for no arguments | `cn()` → `""` |

### `src/stores/__tests__/editor-store.test.ts` (4 tests)

| Test | Description |
|---|---|
| has correct initial state | `isDirty: false, language: "typescript"` |
| setIsDirty updates isDirty | `setIsDirty(true)` → `isDirty === true` |
| setLanguage updates language | `setLanguage("python")` → `language === "python"` |
| reset restores initial state | Apres modifications, `reset()` revient a l'etat initial |

### `src/stores/__tests__/ui-store.test.ts` (12 tests)

Couvre : `setSearch`, `setLanguageFilter` (toggle meme langue → null, switch langue), `toggleTagFilter` (ajout, suppression, accumulation), `clearFilters`, `setViewMode`, `setSidebarOpen`, `setCommandMenuOpen`.

### `src/hooks/__tests__/use-debounce.test.ts` (5 tests)

Utilise `vi.useFakeTimers()`. Couvre : valeur initiale immediate, pas de mise a jour avant le delai, mise a jour apres le delai, reset du timer sur changements rapides, fonctionne avec des nombres.

### `src/hooks/__tests__/use-copy-clipboard.test.ts` (5 tests)

Mock `navigator.clipboard.writeText`. Couvre : etat initial `copied: false`, copie reussie, reset apres timeout, echec clipboard, timeout par defaut 2000ms.

### `src/hooks/__tests__/use-tags.test.ts` (6 tests)

Mock Supabase avec `createSupabaseChain`. Couvre : fetch tags OK, fetch error, tableau vide, creation tag avec `user_id`, erreur si non authentifie, suppression par id.

### `src/hooks/__tests__/use-snippets.test.ts` (15 tests)

Le fichier le plus complet. Couvre :
- **useSnippets** : fetch all avec tags resolues, filtrage tagIds client-side, tableau vide, erreur DB
- **useSnippet** : fetch single avec tags, disabled si id vide
- **useCreateSnippet** : creation avec tags, erreur si non authentifie
- **useUpdateSnippet** : mise a jour champs, remplacement tags
- **useSoftDeleteSnippet** : soft delete (`deleted_at`)
- **useRestoreSnippet** : restauration (`deleted_at = null`)
- **usePermanentDeleteSnippet** : suppression permanente
- **useToggleFavorite** : toggle `is_favorite`

### `src/lib/auth/__tests__/actions.test.ts` (11 tests)

Mock `createServerSupabaseClient` et `redirect` (throw `NEXT_REDIRECT:`). Couvre :
- **login** : redirect OK, erreur credentials
- **signup** : validation email vide, password trop court, success, erreur Supabase
- **signInWithOAuth** : erreur production sans SITE_URL, redirect OAuth OK, erreur OAuth, fallback localhost dev
- **logout** : signOut + redirect /login

### `src/lib/supabase/__tests__/proxy.test.ts` (7 tests)

Mock `@supabase/ssr` `createServerClient`. Couvre :
- Redirect non-authentifie vers /login
- Autorise /login, /signup, /auth/* pour non-authentifie
- Redirect authentifie depuis /login et /signup vers /
- Autorise pages protegees pour authentifie

## Patterns de test

### Tester un Zustand store

```ts
beforeEach(() => {
  useMyStore.setState(initialState); // reset entre chaque test
});

it("action updates state", () => {
  useMyStore.getState().myAction(value);
  expect(useMyStore.getState().myField).toBe(expected);
});
```

### Tester un hook React Query

```ts
import { createWrapper } from "@/test-utils/react-query";
import { getMockedSupabase, createSupabaseChain } from "@/test-utils/supabase-mock";

const mockSupabase = getMockedSupabase();

beforeEach(() => vi.clearAllMocks());

it("fetches data", async () => {
  mockSupabase.from.mockReturnValue(
    createSupabaseChain({ data: [...], error: null })
  );
  const { result } = renderHook(() => useMyHook(), { wrapper: createWrapper() });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
});
```

### Tester une Server Action avec redirect

```ts
// redirect est mocke pour throw "NEXT_REDIRECT:url"
await expect(myAction(formData)).rejects.toThrow("NEXT_REDIRECT:/target");
```

## Regle pour les developpements futurs

Chaque nouvelle fonctionnalite, hook, store ou Server Action **DOIT** etre accompagne de tests unitaires. Lancer `npm test` avant de considerer un developpement comme termine.

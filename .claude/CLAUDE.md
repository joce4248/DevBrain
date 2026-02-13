# Instructions Claude - DevBrain

## Regle fondamentale : Mise a jour obligatoire de la documentation

**A chaque developpement** (nouvelle fonctionnalite, modification, correction de bug, refactoring), la documentation dans le dossier `docs/` **DOIT** etre mise a jour pour refleter les changements. La documentation doit rester une source de verite parfaite et suffisante pour qu'une IA puisse recreer l'application a l'identique.

## Structure de la documentation

La documentation suit une architecture par domaine fonctionnel, numerotee pour guider l'ordre de lecture :

```
docs/
├── 00-overview.md              # Vision globale, tech stack, arborescence fichiers
├── 01-architecture.md          # Patterns, App Router, providers, config Next/TS/shadcn
├── 02-setup.md                 # Installation, env vars, Docker
├── 03-database.md              # Schema Supabase, types generes, clients
├── 04-auth.md                  # Auth flow complet (email, OAuth, middleware, protection routes)
├── 05-snippets.md              # CRUD snippets, editeur, composants, pages
├── 06-tags.md                  # Gestion tags, couleurs, relation many-to-many
├── 07-search-filters.md        # Recherche, filtres, debounce, sanitization
├── 08-ui-layout.md             # Sidebar, topbar, responsive, theming, CSS variables
├── 09-components.md            # Inventaire composants (ui/, layout/, snippets/), props
├── 10-state-management.md      # Zustand stores, React Query hooks, query keys, invalidation
├── 11-constants.md             # Langages, couleurs tags, mappings Monaco, utilitaire cn()
└── 12-testing.md               # Stack de test, conventions, patterns de mock, inventaire tests
```

## Regle fondamentale : Tests obligatoires

**A chaque developpement** (nouvelle fonctionnalite, nouveau hook, nouveau store, nouvelle Server Action, correction de bug, refactoring), des tests unitaires **DOIVENT** etre ecrits ou mis a jour dans le dossier `__tests__/` adjacent au fichier concerne.

### Regles de tests

1. **Chaque nouveau fichier de logique** (hook, store, utilitaire, Server Action) DOIT avoir un fichier de test correspondant dans `__tests__/`
2. **Chaque bug fix** DOIT inclure un test qui reproduit le bug corrige
3. **Lancer `npm test`** a la fin de chaque developpement pour verifier que tous les tests passent
4. **Utiliser les utilitaires existants** : `src/test-utils/react-query.tsx` (wrapper QueryClient) et `src/test-utils/supabase-mock.ts` (factory mock Supabase)
5. **Conventions de mock** : les mocks globaux sont dans `vitest.setup.ts` (Supabase client singleton, next/navigation, clipboard). Les overrides specifiques se font dans chaque test via `vi.clearAllMocks()` + configuration locale
6. **Mettre a jour `docs/12-testing.md`** quand un nouveau fichier de test est ajoute (inventaire des tests)

### Placement des fichiers de test

```
src/lib/__tests__/utils.test.ts              # pour src/lib/utils.ts
src/stores/__tests__/ui-store.test.ts        # pour src/stores/ui-store.ts
src/hooks/__tests__/use-snippets.test.ts     # pour src/hooks/use-snippets.ts
src/lib/auth/__tests__/actions.test.ts       # pour src/lib/auth/actions.ts
```

## Regles de documentation a respecter rigoureusement

### 1. Precision des chemins

Chaque fichier mentionne dans la documentation DOIT inclure son **chemin exact** relatif a `src/` (ex: `src/hooks/use-snippets.ts`). Ne jamais omettre un chemin.

### 2. Types TypeScript complets

Toute interface, type, ou enum utilise dans l'application DOIT etre documente avec sa **definition TypeScript complete** (pas un resume). Inclure les types des props de chaque composant.

### 3. Query keys et invalidation

Chaque hook React Query DOIT documenter :
- Sa **query key exacte** (ex: `["snippets", view, filters]`)
- Sa **strategie d'invalidation** (quelles keys sont invalidees apres mutation)

### 4. Constantes et valeurs exactes

Les constantes (langages, couleurs, mappings) DOIVENT etre reproduites **a l'identique** dans la documentation. Ne pas resumer ou tronquer les listes.

### 5. Comportement fonctionnel

Pour chaque fonctionnalite, documenter :
- Le **comportement attendu** (ce que l'utilisateur voit/fait)
- La **logique d'implementation** (comment c'est code)
- Les **cas limites** (validation, erreurs, etats vides)

### 6. Composants : props et hooks

Chaque composant documente DOIT preciser :
- Son **type** (Server Component ou Client Component)
- Ses **props** avec types exacts
- Les **hooks** qu'il consomme
- Son **etat local** le cas echeant

### 7. Configuration complete

Les fichiers de configuration (`next.config.ts`, `tsconfig.json`, `components.json`, `postcss.config.mjs`, `docker-compose.yml`, `Dockerfile`) DOIVENT etre documentes avec leur contenu exact ou les options significatives.

### 8. Arborescence a jour

Le fichier `00-overview.md` DOIT contenir l'arborescence complete et a jour de tous les fichiers source. Tout nouveau fichier cree doit y etre ajoute.

## Quand mettre a jour quoi

| Type de changement | Fichiers docs a mettre a jour |
|---|---|
| Nouveau composant | `09-components.md` + fichier domaine concerne + `00-overview.md` (arborescence) |
| Nouveau hook | `10-state-management.md` + fichier domaine concerne |
| Nouvelle route/page | `01-architecture.md` (routes) + fichier domaine + `00-overview.md` |
| Modification schema DB | `03-database.md` + types concernes |
| Nouvelle dependance npm | `00-overview.md` (stack technique) |
| Nouveau fichier de config | `00-overview.md` + `01-architecture.md` ou `02-setup.md` |
| Modification constantes | `11-constants.md` |
| Modification auth | `04-auth.md` |
| Modification CSS/theme | `08-ui-layout.md` |
| Nouvelle fonctionnalite | Creer un nouveau fichier `XX-nom.md` si le domaine n'existe pas, sinon mettre a jour le fichier existant |
| Nouveau test / modification tests | `12-testing.md` (inventaire) + `00-overview.md` (arborescence si nouveau fichier) |

## Ajout d'un nouveau domaine fonctionnel

Si une nouvelle fonctionnalite ne rentre dans aucun fichier existant :
1. Creer un nouveau fichier `XX-nom.md` avec le prochain numero disponible
2. Suivre le meme format que les fichiers existants
3. Mettre a jour cette section du CLAUDE.md pour inclure le nouveau fichier
4. Mettre a jour `00-overview.md` pour les nouveaux fichiers dans l'arborescence

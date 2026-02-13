# 03 - Base de donnees

## Fournisseur

**Supabase** (PostgreSQL manage)

## Schema

### Table `snippets`

| Colonne | Type | Contraintes | Description |
|---|---|---|---|
| `id` | `string` (UUID) | PK, auto-genere | Identifiant unique |
| `title` | `string` | NOT NULL | Titre du snippet |
| `content` | `string` (text) | NOT NULL | Code source du snippet |
| `description` | `string \| null` | NULLABLE | Description optionnelle |
| `language` | `string` | NOT NULL | Langage de programmation (cle dans `SUPPORTED_LANGUAGES`) |
| `is_favorite` | `boolean` | DEFAULT `false` | Marque comme favori |
| `deleted_at` | `string \| null` | NULLABLE | Timestamp ISO de suppression douce (null = actif) |
| `created_at` | `string` | Auto-genere | Timestamp de creation |
| `updated_at` | `string` | Auto-genere | Timestamp de derniere modification |
| `user_id` | `string` (UUID) | NOT NULL, FK auth.users | Proprietaire du snippet |

### Table `tags`

| Colonne | Type | Contraintes | Description |
|---|---|---|---|
| `id` | `string` (UUID) | PK, auto-genere | Identifiant unique |
| `name` | `string` | NOT NULL | Nom du tag |
| `color` | `string` | Optionnel a l'insertion | Code couleur hexadecimal (ex: `#6366f1`) |
| `user_id` | `string` (UUID) | NOT NULL, FK auth.users | Proprietaire du tag |

### Table `snippet_tags` (table de jointure many-to-many)

| Colonne | Type | Contraintes | Description |
|---|---|---|---|
| `snippet_id` | `string` (UUID) | FK → `snippets.id` | Reference au snippet |
| `tag_id` | `string` (UUID) | FK → `tags.id` | Reference au tag |

**Foreign Keys** :
- `snippet_tags_snippet_id_fkey` : `snippet_tags.snippet_id` → `snippets.id`
- `snippet_tags_tag_id_fkey` : `snippet_tags.tag_id` → `tags.id`

## Types generes Supabase

Fichier : `src/lib/supabase/types.ts`

Ce fichier definit le type `Database` qui type toutes les operations Supabase. Il contient pour chaque table les types `Row` (lecture), `Insert` (creation), et `Update` (modification) :

```typescript
export type Database = {
  public: {
    Tables: {
      snippets: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          description?: string | null;
          language: string;
          is_favorite?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          description?: string | null;
          language?: string;
          is_favorite?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      snippet_tags: {
        Row: {
          snippet_id: string;
          tag_id: string;
        };
        Insert: {
          snippet_id: string;
          tag_id: string;
        };
        Update: {
          snippet_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "snippet_tags_snippet_id_fkey";
            columns: ["snippet_id"];
            isOneToOne: false;
            referencedRelation: "snippets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "snippet_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
```

## Clients Supabase

### Client navigateur

Fichier : `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Utilise par les hooks React Query (`use-snippets.ts`, `use-tags.ts`) et le `UserMenu`.

### Client serveur

Fichier : `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore in Server Components (read-only)
          }
        },
      },
    }
  );
}
```

Utilise par les Server Actions (`src/lib/auth/actions.ts`) et le callback OAuth.

## Isolation des donnees

Chaque requete filtre implicitement par `user_id` via l'authentification Supabase. La Row Level Security (RLS) doit etre configuree dans Supabase pour que chaque utilisateur ne voie que ses propres donnees.

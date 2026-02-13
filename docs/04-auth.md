# 04 - Authentification

## Vue d'ensemble

L'authentification est geree par **Supabase Auth**. Elle supporte :
- Connexion par email/mot de passe
- Inscription par email/mot de passe
- OAuth via GitHub et Google
- Deconnexion

## Fichiers concernes

| Fichier | Role |
|---|---|
| `src/lib/auth/actions.ts` | Server Actions (login, signup, signInWithOAuth, logout) |
| `src/app/(auth)/login/page.tsx` | Page de connexion |
| `src/app/(auth)/signup/page.tsx` | Page d'inscription |
| `src/app/(auth)/layout.tsx` | Layout auth (centrage ecran) |
| `src/app/auth/callback/route.ts` | Route handler callback OAuth |
| `src/lib/supabase/proxy.ts` | Middleware de session (redirections) |
| `src/proxy.ts` | Point d'entree middleware Next.js |
| `src/components/layout/user-menu.tsx` | Menu utilisateur avec deconnexion |

## Server Actions

Fichier : `src/lib/auth/actions.ts`

Toutes les actions sont marquees `"use server"`.

### `login(formData: FormData)`

1. Cree un client Supabase serveur
2. Extrait `email` et `password` du `FormData`
3. Appelle `supabase.auth.signInWithPassword({ email, password })`
4. Si erreur : retourne `{ error: "Invalid email or password." }`
5. Si succes : `redirect("/")`

### `signup(formData: FormData)`

1. Cree un client Supabase serveur
2. Extrait `email` et `password`
3. Validation : email et password requis, password min 6 caracteres
4. Appelle `supabase.auth.signUp({ email, password })`
5. Si erreur : retourne `{ error: "Unable to create account. Please try again." }`
6. Si succes : retourne `{ success: "Check your email to confirm your account." }`

### `signInWithOAuth(provider: "github" | "google")`

1. Cree un client Supabase serveur
2. Verifie que `NEXT_PUBLIC_SITE_URL` existe en production
3. Appelle `supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })`
4. `redirectTo` = `${siteUrl ?? "http://localhost:3000"}/auth/callback`
5. Si erreur : retourne `{ error: "Unable to sign in with this provider." }`
6. Si succes et `data.url` existe : `redirect(data.url)`

### `logout()`

1. Cree un client Supabase serveur
2. Appelle `supabase.auth.signOut()`
3. `redirect("/login")`

## Callback OAuth

Fichier : `src/app/auth/callback/route.ts`

Route handler GET qui :
1. Extrait le parametre `code` de l'URL
2. Extrait le parametre `next` (defaut: `/`)
3. **Protection open redirect** : verifie que `next` commence par `/` et ne commence pas par `//`
4. Si `code` present : echange le code contre une session via `supabase.auth.exchangeCodeForSession(code)`
5. Si succes : redirect vers `redirectPath`
6. Sinon : redirect vers `/login`

## Page de connexion

Fichier : `src/app/(auth)/login/page.tsx`

Composant client (`"use client"`) avec :
- **Etat local** : `error` (string | null), `loading` (boolean)
- **Formulaire email/password** : appelle `handleSubmit` → `login(formData)`
- **Boutons OAuth** : GitHub (avec SVG inline du logo) et Google (avec SVG inline colore)
- **Lien vers inscription** : `Don't have an account? Sign up` → `/signup`
- **UI** : composant Card shadcn (max-w-sm), titre "DevBrain" avec "Dev" en couleur primary

## Page d'inscription

Fichier : `src/app/(auth)/signup/page.tsx`

Identique en structure a la page de connexion, avec les differences :
- **Etat local supplementaire** : `success` (string | null) — affiche en vert
- Appelle `signup(formData)` au lieu de `login`
- Input password avec `placeholder="Password (min 6 characters)"` et `minLength={6}`
- `autoComplete="new-password"`
- **Lien vers connexion** : `Already have an account? Sign in` → `/login`
- Bouton : "Sign up" / "Creating account..."

## Layout Auth

Fichier : `src/app/(auth)/layout.tsx`

```tsx
<div className="flex min-h-screen items-center justify-center bg-background p-4">
  {children}
</div>
```

Pas de `"use client"` — c'est un Server Component.

## Middleware de protection des routes

Fichier : `src/lib/supabase/proxy.ts` (fonction `updateSession`)

Logique de redirection :
- **Non authentifie** + route protegee (tout sauf `/login`, `/signup`, `/auth/*`) → redirect `/login`
- **Authentifie** + route auth (`/login` ou `/signup`) → redirect `/`

Verification via `supabase.auth.getClaims()` — extrait les claims sans appel reseau supplementaire.

## Deconnexion (UserMenu)

Fichier : `src/components/layout/user-menu.tsx`

1. Charge l'utilisateur au montage via `supabase.auth.getUser()`
2. Affiche un avatar avec l'initiale de l'email dans un cercle colore
3. Popover avec l'email et un bouton "Sign out"
4. Au clic : `queryClient.clear()` (vide tout le cache React Query) puis `logout()` (Server Action)

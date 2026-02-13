# 02 - Installation et configuration

## Prerequis

- Node.js 22+
- npm
- Un projet Supabase avec les tables configurees (voir `03-database.md`)

## Variables d'environnement

Fichier `.env.local` (copier depuis `.env.example`) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optionnel : URL du site pour les redirections OAuth (defaut: http://localhost:3000)
# NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

| Variable | Obligatoire | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Cle anonyme Supabase |
| `NEXT_PUBLIC_SITE_URL` | Non (prod) | URL du site pour les redirections OAuth. Si absent, `http://localhost:3000` est utilise |

## Installation locale

```bash
npm install
cp .env.example .env.local
# Editer .env.local avec vos valeurs Supabase
npm run dev
```

L'application demarre sur `http://localhost:3000`.

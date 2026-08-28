# Gestion Véhicules

Application web de gestion et de réservation des véhicules de l'entreprise.

## Stack

- Next.js 16
- TypeScript
- Supabase
- Vercel

## Installation

Pré-requis : Node.js 22 ou supérieur.

```bash
npm install
npm run dev
```

Créer ensuite un fichier `.env.local` à partir de `.env.example` avec les informations du projet Supabase.

## Pages

- `/` — Tableau de bord (véhicules actifs, disponibilité, réservations du jour)
- `/vehicules` — Gestion des véhicules (CRUD)
- `/entites` — Gestion des entités (CRUD)
- `/reservations` — Liste des réservations (CRUD)
- `/planning` — Planning hebdomadaire par véhicule

## Base de données

Le schéma SQL est disponible dans `supabase/schema.sql`. Il doit être exécuté dans le SQL Editor du projet Supabase.

Aucune authentification n'est requise : l'application utilise la clé publique (anon) de Supabase, et les
politiques RLS autorisent le rôle `anon` à lire/écrire les tables `vehicles`, `entities` et `reservations`.
Toute personne ayant le lien de l'app peut donc consulter et modifier les données.

Le flux Realtime est activé sur les 3 tables : les réservations affichées se mettent à jour automatiquement
pour tous les visiteurs, sans rechargement de page.

## Mettre l'application en ligne

1. Créer un projet sur [Supabase](https://supabase.com), exécuter `supabase/schema.sql` dans le SQL Editor.
2. Récupérer l'URL du projet et la clé publique (`anon`/`publishable`) dans Project Settings > API.
3. Déployer ce dépôt sur [Vercel](https://vercel.com/new), en renseignant `NEXT_PUBLIC_SUPABASE_URL` et
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dans les variables d'environnement du projet.
4. Une fois déployé, partager l'URL Vercel : chacun pourra ajouter des véhicules, des entités et voir les
   réservations en direct.

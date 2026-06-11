# YAS Pronostics Coupe du Monde

Application Next.js légère en français pour gérer des pronostics Coupe du Monde.

## Fonctionnalités

- Aucun compte utilisateur à créer pour pronostiquer.
- Le participant saisit uniquement : prénom, nom, email `@yas.sn` et score prévu.
- Un seul pronostic est autorisé par email et par match. La règle est appliquée côté serveur et par contrainte unique en base de données.
- Matchs entièrement modifiables par l’admin : équipes, date, stade, groupe, notes.
- Résultats réels saisis par l’admin.
- Calcul automatique des points :
  - score exact : 3 points ;
  - bon résultat : 1 point (victoire, défaite ou match nul correctement prédit).
- Classement global en temps réel.
- Drapeaux affichés pour chaque pays sur les matchs et les fiches de pronostic.
- Écran d’accueil supprimé : l’application ouvre directement la page des matchs.
- Admin protégé par mot de passe côté serveur.
- Validation serveur des emails `@yas.sn`.

## Stack

- Next.js 14
- React 18
- Prisma 5
- PostgreSQL Render
- Tailwind CSS 3
- TypeScript

## Lancer en local sans Docker

```cmd
cd "C:\Users\bmd tech\Documents\yas-worldcup-pronostics"

npm install
copy .env.example .env
```

Renseigner `.env` avec l’External Database URL de Render PostgreSQL.

Pour une base neuve :

```cmd
npx prisma db push
npm run db:seed
npm run dev
```

Pour une base déjà utilisée avec une ancienne version qui autorisait plusieurs pronostics par email et par match, nettoyer d’abord les doublons, puis appliquer la contrainte unique :

```cmd
npm run db:dedupe
npm run db:push:force
npm run db:seed
npm run dev
```

Pour réinitialiser une base de test existante et supprimer les anciens pronostics :

```cmd
npm run db:reset
npm run dev
```

Ouvrir :

```text
http://localhost:3000
```

## Calendrier Coupe du Monde 2026

Le seed ajoute maintenant les **104 matchs officiels publiés** :

- les 72 matchs de groupes avec les équipes connues ;
- les matchs à élimination directe avec placeholders, par exemple `Group A winners` ou `Match 73 winners` ;
- toutes les heures sont stockées et affichées en **GMT/UTC**.

Les matchs à élimination directe restent affichés mais les pronostics sont bloqués tant que les équipes exactes ne sont pas connues. L’admin peut ensuite modifier les équipes depuis `/admin/matches`.

## Admin

URL admin :

```text
http://localhost:3000/admin
```

Le mot de passe est celui défini dans `.env` :

```env
ADMIN_PASSWORD="change-this-admin-password"
```

## Render PostgreSQL

En local, utiliser l’External Database URL de Render dans `DATABASE_URL`.

En production sur Render, utiliser l’Internal Database URL.

## Déploiement Render

Build command :

```cmd
npm install && npx prisma generate && npm run build
```

Start command :

```cmd
npm run start
```

Avant le premier lancement en production, exécuter la synchronisation de la base :

```cmd
npx prisma db push
```

ou utiliser les migrations Prisma selon votre process de déploiement.

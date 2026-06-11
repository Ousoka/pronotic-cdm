# Lancer l’application sur Windows sans Docker

## 1. Préparer la base Render PostgreSQL

Sur Render, créer une base PostgreSQL puis copier l’External Database URL.

## 2. Installer les dépendances

```cmd
cd "C:\Users\bmd tech\Documents\yas-worldcup-pronostics"
npm install
```

## 3. Créer le fichier `.env`

```cmd
copy .env.example .env
```

Ouvrir `.env` et renseigner :

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
ADMIN_PASSWORD="un-mot-de-passe-admin-solide"
APP_SECRET="une-cle-longue-et-secrete"
ALLOWED_EMAIL_DOMAIN="yas.sn"
CRON_SECRET="une-cle-cron-optionnelle"
```

## 4. Synchroniser la base

Si la base est nouvelle :

```cmd
npx prisma db push
npm run db:seed
```

Si la base est une base déjà utilisée avec une ancienne version qui autorisait plusieurs pronostics par email et par match :

```cmd
npm run db:dedupe
npm run db:push:force
npm run db:seed
```

Si la base est une base de test et que tu acceptes de supprimer les anciennes données :

```cmd
npm run db:reset
```

## 5. Lancer l’application

```cmd
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

## Notes

Les utilisateurs n’ont pas besoin de se connecter. Ils remplissent seulement prénom, nom, email @yas.sn et score prévu. Un seul pronostic est autorisé par email et par match.

L’admin doit aller sur `/admin` et entrer le mot de passe défini dans `ADMIN_PASSWORD`.

# RIDE'UP

Plateforme de coaching kitesurf : analyse vidéo des figures par IA, roadmap de progression, coach conversationnel et abonnements Stripe.

**Stack :** Next.js 15 (App Router) · Supabase (auth, Postgres, stockage des clips) · Stripe (abonnements) · Claude d'Anthropic (coach + analyse vidéo) · Vercel.

## Ce qui est en place (v1)

| Page | Rôle |
|---|---|
| `/` | Landing |
| `/tarifs` | Formules Standard et Premium, paiement Stripe Checkout |
| `/inscription`, `/connexion`, `/mot-de-passe-oublie` | Comptes Supabase (e-mail + mot de passe) |
| `/dashboard` | Prochaine figure, dernières analyses, état de l'essai |
| `/coach` | Onboarding du profil rider, roadmap de 15 figures, chat avec le coach IA |
| `/analyse` | Envoi d'un clip, historique ; `/analyse/[id]` pour le résultat |
| `/compte` | Abonnement (portail Stripe), profil rider |
| `/admin` | Stats (inscrits, abonnés, revenu estimé, analyses) pour les comptes `is_admin` |

**Essai gratuit :** 1 analyse + 10 messages au coach. **Plans payants :** illimité, avec un garde-fou de 20 analyses et 150 messages par 24 h (`src/lib/plans.ts`).

**Comment marche l'analyse vidéo :** le navigateur envoie le clip dans Supabase Storage (dossier privé de l'utilisateur), en extrait 8 images, et seules ces images partent vers l'API, qui les fait analyser par Claude. Le résultat (note, erreurs, drills, alerte sécurité) est enregistré en base.

**À venir (v2) :** Spot Finder et spots du week-end (Premium), cours vidéo.

## Mise en route

### 1. Supabase
1. Crée un projet sur [supabase.com](https://supabase.com) (région Europe).
2. **SQL Editor** → colle le contenu de `supabase/migrations/0001_init.sql` → **Run**. Ça crée les tables, la sécurité (RLS) et le bucket `clips`.
3. **Authentication → URL Configuration** : *Site URL* = l'URL du site, et ajoute `https://TON-DOMAINE/auth/callback` dans *Redirect URLs* (plus `http://localhost:3000/auth/callback` pour le local).
4. **Project Settings → API** : récupère l'URL, la clé `anon` et la clé `service_role`.
5. Pour te donner l'accès admin : **Table Editor → profiles** → passe `is_admin` à `true` sur ton compte.

### 2. Stripe
1. **Product catalog** : crée un produit « RIDE'UP Standard » avec un prix récurrent mensuel de 9,99 €, et « RIDE'UP Premium » à 15,99 €. Note les deux `price_…`.
2. **Settings → Billing → Customer portal** : active le portail (résiliation, changement de formule entre les deux prix, mise à jour de la carte).
3. **Developers → Webhooks** : ajoute l'endpoint `https://TON-DOMAINE/api/stripe/webhook` avec les événements `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Note le `whsec_…`.

### 3. Anthropic
Crée une clé sur [console.anthropic.com](https://console.anthropic.com).

### 4. Variables d'environnement
Copie `.env.example` en `.env.local` et remplis tout. Mets les mêmes variables dans **Vercel → Settings → Environment Variables**.

### 5. Lancer
```bash
npm install
npm run dev
```
Pour tester les paiements en local : `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

### 6. Déployer
Importe le repo dans Vercel, ajoute les variables, déploie. Puis mets à jour les URL dans Supabase et le webhook Stripe avec le domaine final.

## Avant la mise en ligne
- Compléter les champs surlignés en jaune dans `/mentions-legales`, `/cgu` et `/confidentialite`, et faire relire les pages légales.
- Passer Stripe en mode live (nouvelles clés et nouveaux prix).
- Personnaliser les e-mails d'authentification dans Supabase (Authentication → Email Templates) et brancher un SMTP pour ne pas être limité.

## Structure
```
src/
  app/(site)/        pages publiques (landing, tarifs, auth, légal)
  app/(app)/         espace membre (dashboard, coach, analyse, compte, admin)
  app/api/           checkout, portail, webhook Stripe, coach, analyses
  lib/               plans, figures, IA, quotas, clients Supabase/Stripe
  components/        UI partagée
supabase/migrations/ schéma SQL
```

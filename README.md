# RIDE'UP

Plateforme de coaching kitesurf par IA : analyse vidéo des figures, suivi de progression, coach, cours et Spot Finder.

**Stack :** Next.js 15 (App Router) · Supabase (auth, Postgres, stockage) · Stripe (abonnements) · Claude Sonnet 5.5 d'Anthropic (analyses, coach, programmes) · Open-Meteo (vent) · Leaflet + OpenStreetMap (carte) · Resend (alertes e-mail) · Vercel.

## Fonctionnement

### Analyse vidéo
1. Le rider importe sa vidéo et **sélectionne au doigt un passage de 20 s maximum** (`clip-trimmer.tsx`).
2. Le navigateur calcule une **empreinte du clip**. Si ce passage (même clip, mêmes bornes, même figure, même profondeur) a déjà été analysé, le résultat existant est réaffiché : **aucun appel IA, aucun quota décompté**. Un clip déjà envoyé n'est pas renvoyé.
3. Le navigateur extrait des images du passage et les assemble en **planches numérotées 4 × 3** : 2 planches (24 images) en Progress, 4 planches (48 images) en Elite. Seules ces planches partent vers l'IA, la vidéo reste dans le stockage privé.
4. Claude renvoie un rapport structuré : note globale et par phase (approche, appel, vol, réception), erreurs classées dans une **taxonomie fixe** (`ERROR_CODES` dans `src/lib/tricks.ts`), corrections, exercices, priorité de la prochaine session, alerte sécurité. En Elite, l'analyse est approfondie et **comparée aux tentatives précédentes** de la même figure.
5. Une analyse en échec n'est jamais décomptée.

### Coût IA (Claude Sonnet 5.5 : 2 $ / M tokens en entrée, 10 $ / M en sortie)
| | Coût d'une analyse | Quota | Coût max / mois | Prix |
|---|---|---|---|---|
| Progress | ≈ 0,03 $ | 20 analyses | ≈ 0,60 $ | 14,99 € |
| Elite | ≈ 0,055 $ | 60 analyses | ≈ 3,30 $ | 29,99 € |

Les coûts réels sont enregistrés à chaque appel (table `ai_usage`) et visibles dans **Admin → Vue d'ensemble**. Les quotas se règlent dans **Admin → Offres**, avec le coût maximal recalculé sur les moyennes réelles.

### Progression
Erreurs récurrentes (et leur tendance en Elite), priorités pour la prochaine session, suivi figure par figure (tentatives, meilleure note, courbe en Elite), roadmap de 15 figures, programme personnalisé de 3 à 5 sessions (Elite, 1 par 24 h), coach conversationnel qui connaît l'historique.

### Spot Finder (Progress et Elite)
Pour chaque spot dans le rayon choisi : vent heure par heure sur 7 jours, orientation par rapport à la plage (onshore, side, offshore), créneau ridable selon le niveau, le poids et les kites du rider, taille de kite conseillée, carte. Logique dans `src/lib/wind.ts`. Spots favoris ; alertes vent par e-mail pour Elite (tâche quotidienne `vercel.json`).

La page publique **/week-end** classe tous les spots par vent prévu samedi et dimanche.

### Formules
- **Essai** : 1 analyse et 10 messages au coach (réglable).
- **Progress, 14,99 €** : 20 analyses par mois, coach, historique, progression, Spot Finder.
- **Elite, 29,99 €** : 60 analyses par mois, analyse approfondie et comparée, évolution des erreurs, programme personnalisé, alertes vent.

## Mise en route

### 1. Supabase
1. Crée un projet (région Europe).
2. **SQL Editor** : exécute `supabase/migrations/0001_init.sql`, puis `supabase/seed_spots.sql` (61 spots de départ).
3. **Authentication → URL Configuration** : *Site URL* = l'URL du site, et ajoute `https://TON-DOMAINE/auth/callback` (et `http://localhost:3000/auth/callback`) dans *Redirect URLs*.
4. **Project Settings → API** : URL, clé `anon`, clé `service_role`.
5. Inscris-toi sur le site, puis **Table Editor → profiles** : passe `is_admin` à `true` sur ton compte.

> Les coordonnées et orientations des spots sont approximatives : vérifie-les et corrige-les dans **Admin → Spots** avant le lancement.

### 2. Stripe
1. **Product catalog** : « RIDE'UP Progress » à 14,99 €/mois et « RIDE'UP Elite » à 29,99 €/mois. Note les deux `price_…`.
2. **Settings → Billing → Customer portal** : active la résiliation, le changement de formule (entre ces deux prix) et la mise à jour de la carte.
3. **Developers → Webhooks** : endpoint `https://TON-DOMAINE/api/stripe/webhook`, événements `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.

### 3. Autres services
- **Anthropic** : clé API sur console.anthropic.com.
- **Open-Meteo** : gratuit pour tester. Son usage gratuit est réservé au non commercial : prends une clé payante avant de lancer le site payant.
- **Resend** (alertes Elite) : clé API et domaine d'envoi vérifié.

### 4. Variables d'environnement
Copie `.env.example` en `.env.local`, remplis tout, et mets les mêmes variables dans **Vercel → Settings → Environment Variables** (avec un `CRON_SECRET` aléatoire).

### 5. Lancer
```bash
npm install
npm run dev
```
Paiements en local : `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

### 6. Déployer
Importe le repo dans Vercel, ajoute les variables, déploie, puis mets à jour les URL Supabase et le webhook Stripe avec le domaine final. La tâche d'alertes vent est déclarée dans `vercel.json`.

## Avant la mise en ligne
- Compléter les champs surlignés dans `/mentions-legales`, `/cgu`, `/confidentialite` et faire relire les pages légales.
- Vérifier les spots (coordonnées, orientation, réglementation locale).
- Passer Stripe en mode live, prendre la clé Open-Meteo commerciale, personnaliser les e-mails Supabase et brancher un SMTP.
- Tester l'analyse avec de vraies vidéos de chaque niveau et ajuster les consignes dans `src/lib/ai.ts` si besoin.

## Structure
```
src/
  app/(site)/        public : accueil, tarifs, cours, week-end, auth, légal
  app/(app)/         espace membre : dashboard, analyse, historique, progression, coach, spots, profil, compte, admin
  app/api/           analyses, coach, checkout, portail, webhook Stripe, cron alertes vent
  lib/               ai (prompts + coûts), plans, usage (quotas), progress, wind (Spot Finder), weather, frames (vidéo)
  components/        UI (découpe vidéo, carte, formulaires…)
supabase/            schéma SQL et spots de départ
```
